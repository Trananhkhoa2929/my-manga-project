"""
Manga OCR Service - Specialized for Japanese Manga Text Detection
Combines YOLOv8 bubble detection + manga-ocr for accurate results
"""

import logging
from typing import List
from PIL import Image
import io
import uuid

logger = logging.getLogger(__name__)

# Lazy load manga-ocr to save memory
_manga_ocr = None


def get_manga_ocr():
    """Get or initialize manga-ocr model (lazy loading)"""
    global _manga_ocr
    
    if _manga_ocr is None:
        try:
            from manga_ocr import MangaOcr
            logger.info("🔄 Loading manga-ocr model...")
            _manga_ocr = MangaOcr()
            logger.info("✅ manga-ocr loaded!")
        except ImportError as e:
            logger.error(f"manga-ocr not installed: {e}")
            raise
        except Exception as e:
            logger.error(f"Failed to load manga-ocr: {e}")
            raise
    
    return _manga_ocr


def is_valid_japanese_text(text: str) -> bool:
    """Check if text contains valid Japanese characters"""
    if not text or len(text.strip()) < 1:
        return False
    
    japanese_count = 0
    for char in text:
        code = ord(char)
        if (0x3040 <= code <= 0x309F or  # Hiragana
            0x30A0 <= code <= 0x30FF or  # Katakana
            0x4E00 <= code <= 0x9FFF or  # Kanji
            0x3000 <= code <= 0x303F):   # Japanese punctuation
            japanese_count += 1
    
    return japanese_count / len(text) > 0.2 if text else False


def recognize_manga_text(image: Image.Image) -> str:
    """Recognize Japanese text using manga-ocr"""
    mocr = get_manga_ocr()
    text = mocr(image)
    return text.strip()


def process_manga_page(
    image_bytes: bytes,
    detect_regions: bool = True,
    min_region_area: int = 500
) -> List[dict]:
    """
    Process manga page: YOLOv8 bubble detection + manga-ocr
    """
    import numpy as np
    import cv2
    
    # Load image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    logger.info(f"Processing manga: {image.width}x{image.height}")
    
    bubbles = []
    
    # Try YOLOv8 bubble detection first
    try:
        from app.services.bubble_detector_service import (
            detect_speech_bubbles,
            is_bubble_detector_available
        )
        
        if is_bubble_detector_available():
            logger.info("Using YOLOv8 speech bubble detector")
            yolo_bubbles = detect_speech_bubbles(
                img_cv,
                confidence_threshold=0.3,
                iou_threshold=0.5
            )
            bubbles = [(x, y, w, h) for x, y, w, h, conf, cls in yolo_bubbles]
            logger.info(f"YOLOv8 detected {len(bubbles)} bubbles")
    except Exception as e:
        logger.warning(f"YOLOv8 failed: {e}, using fallback")
    
    # Fallback: simple white region detection
    if not bubbles:
        logger.info("Using fallback white region detection")
        bubbles = detect_white_regions(img_cv)
    
    if not bubbles:
        logger.warning("No bubbles detected")
        return []
    
    # OCR each bubble
    results = []
    for idx, (x, y, w, h) in enumerate(bubbles):
        try:
            # Crop and OCR
            bubble_img = image.crop((x, y, x + w, y + h))
            text = recognize_manga_text(bubble_img)
            
            if text and len(text.strip()) > 0:  # Accept any non-empty text
                results.append({
                    'id': f'region-{uuid.uuid4().hex[:8]}',
                    'text': text,
                    'confidence': 90.0,
                    'bounding_box': {'x': x, 'y': y, 'width': w, 'height': h}
                })
                logger.info(f"Bubble {idx+1}: '{text[:20]}...'")
        except Exception as e:
            logger.warning(f"OCR failed for bubble {idx+1}: {e}")
    
    logger.info(f"Extracted {len(results)} text regions")
    return results


def detect_white_regions(img_cv) -> List[tuple]:
    """Fallback: detect white/light regions as potential bubbles"""
    import cv2
    import numpy as np
    
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # Lower threshold to catch off-white/gray bubbles
    _, white_mask = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)  # Lowered from 200
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (8, 8))  # Smaller kernel
    white_mask = cv2.morphologyEx(white_mask, cv2.MORPH_CLOSE, kernel)
    white_mask = cv2.morphologyEx(white_mask, cv2.MORPH_OPEN, kernel)
    
    contours, _ = cv2.findContours(white_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    bubbles = []
    # Use ABSOLUTE pixel values instead of percentage (for small text in long images)
    min_area = 100  # 10x10 pixels minimum
    max_area = (w * h) * 0.25  # Up to 25% of slice
    
    for contour in contours:
        x, y, bw, bh = cv2.boundingRect(contour)
        area = bw * bh
        aspect = bw / bh if bh > 0 else 0
        
        # Very relaxed aspect ratio for vertical/horizontal text
        if min_area < area < max_area and 0.1 < aspect < 10.0:
            bubbles.append((x, y, bw, bh))
    
    bubbles.sort(key=lambda b: (b[1] // 50, b[0]))  # Finer sorting grid
    logger.info(f"White region detection found {len(bubbles)} regions")
    return bubbles[:100]  # Increased limit


def detect_text_contours(img_cv) -> List[tuple]:
    """
    Detect dark text on light backgrounds using adaptive threshold.
    Optimized for small text in webtoons.
    """
    import cv2
    import numpy as np
    
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # Smaller blur for sharp small text
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    
    # Smaller block size for small characters
    binary = cv2.adaptiveThreshold(
        blurred, 255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY_INV, 
        11,  # Reduced from 21 for smaller text
        8    # Reduced C constant
    )
    
    # Smaller kernel to avoid merging separate text blocks
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (8, 4))  # Smaller: was (20, 10)
    dilated = cv2.dilate(binary, kernel, iterations=1)  # Reduced iterations
    
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    regions = []
    min_area = 50  # Absolute minimum: 7x7 pixels
    max_area = (w * h) * 0.3
    
    for contour in contours:
        x, y, bw, bh = cv2.boundingRect(contour)
        area = bw * bh
        
        # Lowered size requirements for small text
        if min_area < area < max_area and bw > 8 and bh > 6:
            # Add padding
            pad = 5
            x = max(0, x - pad)
            y = max(0, y - pad)
            bw = min(w - x, bw + 2 * pad)
            bh = min(h - y, bh + 2 * pad)
            regions.append((x, y, bw, bh))
    
    regions.sort(key=lambda b: (b[1] // 50, b[0]))
    logger.info(f"Text contour detection found {len(regions)} regions")
    return regions[:150]  # Increased limit


def is_manga_ocr_available() -> bool:
    """Check if manga-ocr is available"""
    try:
        import manga_ocr
        return True
    except ImportError:
        return False
