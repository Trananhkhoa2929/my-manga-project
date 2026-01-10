"""
Inpainting Router - Text Removal
Remove text from manga pages using OpenCV or LaMa
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import numpy as np
import cv2
import io
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/inpaint", tags=["Inpainting"])


class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


@router.post("/clean")
async def clean_text_areas(
    file: UploadFile = File(...),
    regions: str = Form(...),  # JSON string of bounding boxes
    padding: int = Form(5),
    method: str = Form("telea"),  # telea, ns, or lama
):
    """
    Remove text from specified regions using inpainting.
    
    Args:
        file: Original manga page image
        regions: JSON array of bounding box objects [{x, y, width, height}, ...]
        padding: Extra padding around text regions (pixels)
        method: Inpainting method (telea, ns, or lama)
    
    Returns:
        Cleaned image with text removed (PNG)
    """
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Parse regions
        try:
            boxes = json.loads(regions)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid regions JSON")
        
        logger.info(f"Inpainting {len(boxes)} regions with method: {method}")
        
        # Create mask for inpainting
        mask = np.zeros(img.shape[:2], dtype=np.uint8)
        
        for box in boxes:
            x = max(0, box["x"] - padding)
            y = max(0, box["y"] - padding)
            w = box["width"] + padding * 2
            h = box["height"] + padding * 2
            
            # Ensure within image bounds
            x2 = min(img.shape[1], x + w)
            y2 = min(img.shape[0], y + h)
            
            # Fill mask with white (area to inpaint)
            cv2.rectangle(mask, (x, y), (x2, y2), 255, -1)
        
        # Apply inpainting
        if method == "telea":
            result = cv2.inpaint(img, mask, inpaintRadius=7, flags=cv2.INPAINT_TELEA)
        elif method == "ns":
            result = cv2.inpaint(img, mask, inpaintRadius=7, flags=cv2.INPAINT_NS)
        elif method == "lama":
            # LaMa would require the lama-cleaner library
            # For now, fall back to TELEA
            logger.warning("LaMa not installed, falling back to TELEA")
            result = cv2.inpaint(img, mask, inpaintRadius=7, flags=cv2.INPAINT_TELEA)
        else:
            result = cv2.inpaint(img, mask, inpaintRadius=7, flags=cv2.INPAINT_TELEA)
        
        # Encode result as PNG
        _, buffer = cv2.imencode('.png', result)
        
        return StreamingResponse(
            io.BytesIO(buffer.tobytes()),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=cleaned.png"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Inpainting error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inpainting failed: {str(e)}")


@router.post("/clean-auto")
async def auto_clean_text(
    file: UploadFile = File(...),
    language: str = Form("jpn"),
    confidence_threshold: float = Form(0.7),
    method: str = Form("telea"),
):
    """
    Automatically detect and remove text from manga page.
    Combines OCR detection with inpainting.
    
    Args:
        file: Original manga page image
        language: Source language for OCR detection
        confidence_threshold: Minimum confidence to consider as text (0-1)
        method: Inpainting method
    
    Returns:
        Cleaned image with all detected text removed
    """
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Import OCR function
        from app.routers.ocr import get_ocr_engine
        
        ocr = get_ocr_engine(language)
        
        # Create mask
        mask = np.zeros(img.shape[:2], dtype=np.uint8)
        regions_count = 0
        
        if ocr is not None:
            result = ocr.ocr(img, cls=True)
            
            if result and result[0]:
                for line in result[0]:
                    box = line[0]
                    _, confidence = line[1]
                    
                    if confidence >= confidence_threshold:
                        # Get bounding rectangle
                        x_coords = [int(p[0]) for p in box]
                        y_coords = [int(p[1]) for p in box]
                        
                        x1 = max(0, min(x_coords) - 5)
                        y1 = max(0, min(y_coords) - 5)
                        x2 = min(img.shape[1], max(x_coords) + 5)
                        y2 = min(img.shape[0], max(y_coords) + 5)
                        
                        cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)
                        regions_count += 1
        
        logger.info(f"Auto-cleaning {regions_count} detected text regions")
        
        # Apply inpainting
        if method == "telea":
            result = cv2.inpaint(img, mask, inpaintRadius=7, flags=cv2.INPAINT_TELEA)
        else:
            result = cv2.inpaint(img, mask, inpaintRadius=7, flags=cv2.INPAINT_NS)
        
        # Encode result
        _, buffer = cv2.imencode('.png', result)
        
        return StreamingResponse(
            io.BytesIO(buffer.tobytes()),
            media_type="image/png",
            headers={
                "Content-Disposition": "attachment; filename=auto_cleaned.png",
                "X-Regions-Cleaned": str(regions_count),
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auto-clean error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Auto-clean failed: {str(e)}")


@router.get("/methods")
async def get_inpainting_methods():
    """Get available inpainting methods"""
    return {
        "methods": [
            {
                "id": "telea",
                "name": "TELEA",
                "description": "Fast method based on Fast Marching Method",
                "quality": "medium",
                "speed": "fast",
            },
            {
                "id": "ns",
                "name": "Navier-Stokes",
                "description": "Fluid dynamics based method",
                "quality": "medium-high",
                "speed": "medium",
            },
            {
                "id": "lama",
                "name": "LaMa",
                "description": "Deep learning based (requires GPU)",
                "quality": "high",
                "speed": "slow",
                "available": False,  # Change to True when installed
            },
        ]
    }
