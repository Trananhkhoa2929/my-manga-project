"""
OCR Router - PaddleOCR Integration
Detect and extract text from manga pages
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import cv2
import time
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ocr", tags=["OCR"])

# OCR engines will be loaded lazily
_ocr_engines = {}

def get_ocr_engine(language: str):
    """Get or create OCR engine for specified language"""
    global _ocr_engines
    
    if language not in _ocr_engines:
        try:
            from paddleocr import PaddleOCR
            
            lang_map = {
                "jpn": "japan",
                "kor": "korean", 
                "chi_sim": "ch",
                "chi_tra": "chinese_cht",
                "eng": "en",
                "vie": "vi",
            }
            
            paddle_lang = lang_map.get(language, "en")
            logger.info(f"Loading PaddleOCR for language: {paddle_lang}")
            
            _ocr_engines[language] = PaddleOCR(
                use_angle_cls=True,
                lang=paddle_lang,
                show_log=False,
            )
        except ImportError:
            logger.warning("PaddleOCR not installed, using mock OCR")
            _ocr_engines[language] = None
            
    return _ocr_engines[language]


class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class TextRegion(BaseModel):
    id: str
    text: str
    confidence: float
    bounding_box: BoundingBox


class OCRResponse(BaseModel):
    success: bool
    regions: List[TextRegion]
    language: str
    processing_time_ms: float
    message: Optional[str] = None


@router.post("/detect", response_model=OCRResponse)
async def detect_text(
    file: UploadFile = File(...),
    language: str = Form("jpn"),
):
    """
    Detect and extract text from manga page image.
    
    Args:
        file: Image file (PNG, JPG, WebP)
        language: Source language (jpn, kor, chi_sim, chi_tra, eng, vie)
    
    Returns:
        List of detected text regions with bounding boxes
    """
    start_time = time.time()
    
    try:
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        logger.info(f"Processing image: {file.filename}, size: {img.shape}")
        
        # Get OCR engine
        ocr = get_ocr_engine(language)
        
        regions = []
        
        if ocr is not None:
            # Use PaddleOCR
            result = ocr.ocr(img, cls=True)
            
            if result and result[0]:
                for idx, line in enumerate(result[0]):
                    box = line[0]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
                    text, confidence = line[1]
                    
                    # Convert polygon to rectangle
                    x_coords = [p[0] for p in box]
                    y_coords = [p[1] for p in box]
                    
                    regions.append(TextRegion(
                        id=f"region-{uuid.uuid4().hex[:8]}",
                        text=text.strip(),
                        confidence=confidence * 100,
                        bounding_box=BoundingBox(
                            x=int(min(x_coords)),
                            y=int(min(y_coords)),
                            width=int(max(x_coords) - min(x_coords)),
                            height=int(max(y_coords) - min(y_coords)),
                        )
                    ))
        else:
            # Mock OCR for testing without PaddleOCR installed
            logger.warning("Using mock OCR response")
            regions = [
                TextRegion(
                    id="region-mock-1",
                    text="サンプルテキスト",
                    confidence=95.0,
                    bounding_box=BoundingBox(x=100, y=100, width=200, height=50)
                ),
                TextRegion(
                    id="region-mock-2", 
                    text="もう一つのテキスト",
                    confidence=92.0,
                    bounding_box=BoundingBox(x=100, y=200, width=180, height=45)
                ),
            ]
        
        processing_time = (time.time() - start_time) * 1000
        
        logger.info(f"OCR completed: {len(regions)} regions found in {processing_time:.2f}ms")
        
        return OCRResponse(
            success=True,
            regions=regions,
            language=language,
            processing_time_ms=processing_time,
            message=f"Detected {len(regions)} text regions",
        )
        
    except Exception as e:
        logger.error(f"OCR error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported OCR languages"""
    return {
        "languages": [
            {"code": "jpn", "name": "Japanese", "native": "日本語"},
            {"code": "kor", "name": "Korean", "native": "한국어"},
            {"code": "chi_sim", "name": "Chinese (Simplified)", "native": "简体中文"},
            {"code": "chi_tra", "name": "Chinese (Traditional)", "native": "繁體中文"},
            {"code": "eng", "name": "English", "native": "English"},
            {"code": "vie", "name": "Vietnamese", "native": "Tiếng Việt"},
        ]
    }
