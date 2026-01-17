"""
Speech Bubble Detector Service
Uses YOLOv8 model for accurate speech bubble detection in manga/comics
Model: ogkalu/comic-speech-bubble-detector-yolov8m (97.4% mAP)
"""

import logging
from typing import List, Tuple, Optional
from pathlib import Path
import os

logger = logging.getLogger(__name__)

# Lazy load model
_bubble_detector = None
_model_path = None


def get_model_path() -> str:
    """Download and cache the YOLOv8 bubble detector model"""
    global _model_path
    
    if _model_path and os.path.exists(_model_path):
        return _model_path
    
    try:
        from huggingface_hub import hf_hub_download
        
        logger.info("📥 Downloading YOLOv8 speech bubble detector...")
        
        # Download model from Hugging Face
        _model_path = hf_hub_download(
            repo_id="ogkalu/comic-speech-bubble-detector-yolov8m",
            filename="comic-speech-bubble-detector.pt",
            cache_dir=Path(__file__).parent / "models"
        )
        
        logger.info(f"✅ Model downloaded to: {_model_path}")
        return _model_path
        
    except Exception as e:
        logger.error(f"Failed to download model: {e}")
        raise


def get_bubble_detector():
    """Get or initialize YOLOv8 bubble detector (lazy loading)"""
    global _bubble_detector
    
    if _bubble_detector is None:
        try:
            from ultralytics import YOLO
            
            model_path = get_model_path()
            logger.info("🔄 Loading YOLOv8 bubble detector...")
            _bubble_detector = YOLO(model_path)
            logger.info("✅ Bubble detector loaded successfully!")
            
        except ImportError as e:
            logger.error(f"ultralytics not installed: {e}")
            raise ImportError("ultralytics not installed. Run: pip install ultralytics")
        except Exception as e:
            logger.error(f"Failed to load bubble detector: {e}")
            raise
    
    return _bubble_detector


def detect_speech_bubbles(
    image_path_or_array,
    confidence_threshold: float = 0.5,
    iou_threshold: float = 0.5
) -> List[Tuple[int, int, int, int, float, str]]:
    """
    Detect speech bubbles in manga/comic image using YOLOv8.
    
    Args:
        image_path_or_array: Path to image or numpy array
        confidence_threshold: Minimum confidence score (0-1)
        iou_threshold: IoU threshold for NMS
    
    Returns:
        List of (x, y, width, height, confidence, class_name) tuples
    """
    detector = get_bubble_detector()
    
    # Run inference
    results = detector(
        image_path_or_array,
        conf=confidence_threshold,
        iou=iou_threshold,
        verbose=False
    )
    
    bubbles = []
    
    for result in results:
        boxes = result.boxes
        
        if boxes is not None:
            for box in boxes:
                # Get bounding box coordinates (xyxy format)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = box.conf[0].item()
                class_id = int(box.cls[0].item())
                class_name = result.names.get(class_id, "bubble")
                
                # Convert to x, y, width, height
                x = int(x1)
                y = int(y1)
                width = int(x2 - x1)
                height = int(y2 - y1)
                
                bubbles.append((x, y, width, height, confidence, class_name))
    
    # Sort by position (top to bottom, left to right)
    bubbles.sort(key=lambda b: (b[1] // 100, b[0]))
    
    logger.info(f"Detected {len(bubbles)} speech bubbles")
    return bubbles


def is_bubble_detector_available() -> bool:
    """Check if YOLOv8 and model are available"""
    try:
        from ultralytics import YOLO
        return True
    except ImportError:
        return False
