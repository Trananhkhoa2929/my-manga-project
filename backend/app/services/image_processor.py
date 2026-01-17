"""
Manga Image Processor
Advanced pipeline for:
1. Long image handling (Sliding Window)
2. Robust text detection (YOLOv8/Paddle + NMS)
3. Surgical text removal (Adaptive Inpainting)
"""

import cv2
import numpy as np
import logging
from typing import List, Tuple, Dict, Optional
from PIL import Image
import io
import uuid

logger = logging.getLogger(__name__)

class MangaProcessor:
    def __init__(self, use_yolo: bool = True):
        self.use_yolo = use_yolo
        # Thresholds can be adjusted here
        self.slice_height = 2000  # Height of each slice for long images
        self.overlap = 500        # Overlap to prevent splitting bubbles
        self.iou_threshold = 0.3  # Intersection over Union for NMS
        
    def process(self, image_bytes: bytes, progress_callback=None) -> Tuple[List[Dict], np.ndarray]:
        """
        Main pipeline:
        1. Read Image
        2. Detect Text (Sliding Window)
        3. Clean Image (Surgical Inpainting)
        4. Return Regions & Cleaned Image
        """
        if progress_callback:
            progress_callback(5, "Đang đọc ảnh...")

        # 1. Load Image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ValueError("Could not decode image")
            
        full_h, full_w = img_bgr.shape[:2]
        logger.info(f"Processing image: {full_w}x{full_h}")

        if progress_callback:
            progress_callback(10, "Đang chia nhỏ ảnh (Sliding Window)...")

        # 2. Detect Text with Sliding Window
        raw_boxes = self._sliding_window_detection(img_bgr, progress_callback)
        
        if progress_callback:
            progress_callback(40, "Đang lọc trùng lặp (NMS)...")

        # 3. Deduplicate (NMS)
        final_boxes = self._non_max_suppression(raw_boxes)
        # Sort top-to-bottom
        final_boxes.sort(key=lambda b: b[1]) 
        
        logger.info(f"Detected {len(final_boxes)} unique text regions")

        if progress_callback:
            progress_callback(50, f"Đang tẩy {len(final_boxes)} vùng text...")

        # 4. Surgical Inpainting (Clean Text)
        cleaned_img = self._surgical_inpainting(img_bgr, final_boxes, progress_callback)
        
        # 5. Format Results
        regions = []
        for x, y, w, h in final_boxes:
            regions.append({
                'id': f'region-{uuid.uuid4().hex[:8]}',
                'bounding_box': {'x': x, 'y': y, 'width': w, 'height': h}
            })
            
        return regions, cleaned_img

    def _sliding_window_detection(self, img: np.ndarray, progress_callback=None) -> List[Tuple[int, int, int, int]]:
        """
        Slice image into overlapping chunks and detect text in each.
        Returns list of (x, y, w, h) in global coordinates.
        """
        h, w = img.shape[:2]
        boxes = []
        
        y = 0
        total_steps = h // (self.slice_height - self.overlap) + 1
        current_step = 0

        while y < h:
            current_step += 1
            if progress_callback:
                pct = 10 + int((current_step / total_steps) * 30) # 10% -> 40%
                progress_callback(pct, f"Đang quét phần {current_step}/{int(total_steps)}...")

            # Calculate slice boundaries
            y_end = min(y + self.slice_height, h)
            
            # Slice image
            img_slice = img[y:y_end, :]
            
            # Run Detection on Slice
            slice_boxes = self._detect_in_slice(img_slice)
            
            # Adjust coordinates and add to list
            for sx, sy, sw, sh in slice_boxes:
                global_y = sy + y
                boxes.append((int(sx), int(global_y), int(sw), int(sh)))
            
            if y_end == h:
                break
            y += (self.slice_height - self.overlap)
            
        return boxes

    def _detect_in_slice(self, img_slice: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Run YOLOv8 or fallback detection on a single slice"""
        boxes = []
        slice_h, slice_w = img_slice.shape[:2]
        print(f"👉 [Detect] Processing slice: {slice_w}x{slice_h}")
        
        try:
            # Try YOLOv8 from our service
            from app.services.bubble_detector_service import detect_speech_bubbles, is_bubble_detector_available
            
            yolo_available = is_bubble_detector_available()
            print(f"👉 [Detect] YOLOv8 available: {yolo_available}, use_yolo: {self.use_yolo}")
            
            if self.use_yolo and yolo_available:
                try:
                    results = detect_speech_bubbles(img_slice, confidence_threshold=0.3)
                    boxes = [(r[0], r[1], r[2], r[3]) for r in results]
                    print(f"👉 [Detect] YOLOv8 found {len(boxes)} bubbles")
                except Exception as yolo_err:
                    print(f"❌ [Detect] YOLOv8 error: {yolo_err}")
                
            if not boxes:
                # Fallback 1: White region detection
                print("👉 [Detect] Trying white region fallback...")
                from app.services.manga_ocr_service import detect_white_regions
                boxes = detect_white_regions(img_slice)
                print(f"👉 [Detect] White region found {len(boxes)} regions")
                
            if not boxes:
                # Fallback 2: Text contour detection (dark text on light bg)
                print("👉 [Detect] Trying text contour fallback...")
                from app.services.manga_ocr_service import detect_text_contours
                boxes = detect_text_contours(img_slice)
                print(f"👉 [Detect] Text contour found {len(boxes)} regions")
                
        except Exception as e:
            print(f"❌ [Detect] Critical error in slice: {e}")
            import traceback
            traceback.print_exc()
            
        print(f"👉 [Detect] Final boxes from slice: {len(boxes)}")
        return boxes


    def _non_max_suppression(self, boxes: List[Tuple], threshold: float = 0.3) -> List[Tuple]:
        """
        Merge overlapping boxes using Malisiewicz et al. method.
        boxes: List of (x, y, w, h)
        """
        if not boxes:
            return []
            
        # Convert to specific format for NMS: (x1, y1, x2, y2)
        # x, y, w, h -> x1, y1, x2, y2
        b_array = np.array(boxes).astype(float)
        
        if len(boxes) == 0:
            return []
            
        pick = []
        
        x1 = b_array[:, 0]
        y1 = b_array[:, 1]
        x2 = b_array[:, 0] + b_array[:, 2]
        y2 = b_array[:, 1] + b_array[:, 3]
        
        area = (x2 - x1 + 1) * (y2 - y1 + 1)
        idxs = np.argsort(y2)
        
        while len(idxs) > 0:
            last = idxs.shape[0] - 1
            i = idxs[last]
            pick.append(i)
            
            xx1 = np.maximum(x1[i], x1[idxs[:last]])
            yy1 = np.maximum(y1[i], y1[idxs[:last]])
            xx2 = np.minimum(x2[i], x2[idxs[:last]])
            yy2 = np.minimum(y2[i], y2[idxs[:last]])
            
            w = np.maximum(0, xx2 - xx1 + 1)
            h = np.maximum(0, yy2 - yy1 + 1)
            
            overlap = (w * h) / area[idxs[:last]]
            
            idxs = np.delete(idxs, np.concatenate(([last], np.where(overlap > threshold)[0])))
            
        return [boxes[i] for i in pick]

    def _surgical_inpainting(self, img: np.ndarray, boxes: List[Tuple], progress_callback=None) -> np.ndarray:
        """
        Remove ONLY text pixels using advanced adaptive masking.
        Preserves background art and bubble borders.
        """
        cleaned = img.copy()
        total_boxes = len(boxes)
        
        for idx, (x, y, w, h) in enumerate(boxes):
            if progress_callback and idx % 5 == 0:
                pct = 50 + int((idx / total_boxes) * 40) # 50% -> 90%
                progress_callback(pct, f"Đang tẩy vùng {idx+1}/{total_boxes}...")

            # 1. Padding with boundary checks
            pad = 10
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(img.shape[1], x + w + pad)
            y2 = min(img.shape[0], y + h + pad)
            
            roi = cleaned[y1:y2, x1:x2]
            if roi.size == 0: continue
            
            # 2. Advanced Adaptive Masking
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            
            # CLAHE (Contrast Limited Adaptive Histogram Equalization)
            # Improves contrast before thresholding, helping with faded text
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced_gray = clahe.apply(gray)
            
            # Adaptive Thresholding (Gaussian)
            # Better than Otsu for varying lighting conditions within a bubble
            mask = cv2.adaptiveThreshold(
                enhanced_gray, 
                255, 
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY_INV, 
                15, # Block size (must be odd)
                10  # C constant
            )
            
            # 3. Noise Filtering (Connected Components)
            # Remove tiny specks that are likely noise, not text
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
            
            # Create a clean mask
            clean_mask = np.zeros_like(mask)
            
            # Filter components based on area
            # Text characters usually have area > 15-20 pixels
            min_area = 15  
            max_area = (w * h) * 0.9 # Ignore if it covers the entire bubble (likely error)
            
            for i in range(1, num_labels): # Skip background (label 0)
                area = stats[i, cv2.CC_STAT_AREA]
                if min_area < area < max_area:
                    clean_mask[labels == i] = 255
            
            # 4. Refine Mask
            # Close small holes inside characters
            kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
            clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, kernel_close)
            
            # Dilate MINIMALLY to cover anti-aliasing pixels around text
            # iterations=1 and small kernel to avoid expanding into bubble border
            kernel_dilate = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
            dilated_mask = cv2.dilate(clean_mask, kernel_dilate, iterations=1)
            
            # 5. Inpaint
            # Navier-Stokes (INPAINT_NS) often preserves gradients better than Telea for larger areas
            # But Telea is sharper for thin text. Let's stick to Telea for text.
            inpainted_roi = cv2.inpaint(roi, dilated_mask, 3, cv2.INPAINT_TELEA)
            
            # Restore ROI
            cleaned[y1:y2, x1:x2] = inpainted_roi
            
        return cleaned

# Singleton instance
_processor = None

def get_manga_processor():
    global _processor
    if _processor is None:
        _processor = MangaProcessor()
    return _processor
