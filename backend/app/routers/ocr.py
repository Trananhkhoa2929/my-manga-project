"""
OCR Router - Cotrans API + Advanced Local Pipeline
Detect, OCR, and surgically inpaint text from manga pages
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import cv2
import time
import uuid
import logging
import base64

import asyncio

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ocr", tags=["OCR"])

# --- Job Store (In-Memory) ---
# Format: { "job_id": { "status": "pending|processing|completed|failed", "progress": 0, "message": "", "result": None, "error": None } }
ocr_jobs = {}

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
    translated_text: Optional[str] = None


class OCRResponse(BaseModel):
    success: bool
    regions: List[TextRegion]
    language: str
    processing_time_ms: float
    engine: str = "unknown"
    message: Optional[str] = None
    cleaned_image: Optional[str] = None  # Base64 string of inpainted image


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: int
    message: str
    result: Optional[OCRResponse] = None
    error: Optional[str] = None


async def process_with_cotrans(contents: bytes, language: str, target_lang: str = "vie") -> dict:
    """Process image with Cotrans cloud API"""
    from app.services.cotrans_service import process_manga_with_cotrans
    
    result = await process_manga_with_cotrans(
        contents,
        source_lang=language,
        target_lang=target_lang
    )
    
    if not result.get("success"):
        raise Exception(result.get("error", "Cotrans failed"))
    
    regions = []
    for r in result.get("regions", []):
        regions.append(TextRegion(
            id=r.get('id', f"region-{uuid.uuid4().hex[:8]}"),
            text=r.get('text', ''),
            confidence=r.get('confidence', 90.0),
            bounding_box=BoundingBox(**r.get('bounding_box', {'x': 0, 'y': 0, 'width': 100, 'height': 50})),
            translated_text=r.get('translatedText')
        ))
    
    return {
        "regions": regions,
        "cleaned_image": result.get("translated_image") # Cotrans returns translated image, usually clean
    }


def process_with_local_pipeline(contents: bytes) -> dict:
    """
    Process with Advanced Local Pipeline:
    Sliding Window Detection + Surgical Inpainting + MangaOCR
    """
    from app.services.image_processor import get_manga_processor
    from app.services.manga_ocr_service import recognize_manga_text, is_valid_japanese_text
    from PIL import Image
    import io
    
    processor = get_manga_processor()
    
    # 1. Detect & Clean (Inpaint)
    # This returns regions (boxes) and the surgically cleaned image (numpy)
    region_dicts, cleaned_img_cv = processor.process(contents)
    
    # 2. Convert Cleaned Image to Base64
    _, buffer = cv2.imencode('.png', cleaned_img_cv)
    cleaned_image_b64 = base64.b64encode(buffer).decode('utf-8')
    
    # 3. Perform OCR on Original Image Crops
    # Reuse the logic of cropping from original image for best OCR quality
    # (OCR on cleaned image would be empty!)
    original_pil = Image.open(io.BytesIO(contents)).convert('RGB')
    
    final_regions = []
    
    for r in region_dicts:
        bbox = r['bounding_box']
        x, y, w, h = bbox['x'], bbox['y'], bbox['width'], bbox['height']
        
        # Crop from original
        crop = original_pil.crop((x, y, x + w, y + h))
        
        try:
            # Recognize Text
            text = recognize_manga_text(crop)
            
            # Simple validation
            if text:
                final_regions.append(TextRegion(
                    id=r['id'],
                    text=text,
                    confidence=90.0,
                    bounding_box=BoundingBox(x=x, y=y, width=w, height=h)
                ))
        except Exception as e:
            logger.warning(f"OCR failed for region: {e}")
            
    return {
        "regions": final_regions,
        "cleaned_image": f"data:image/png;base64,{cleaned_image_b64}"
    }

async def run_ocr_job(job_id: str, contents: bytes, language: str, target_language: str, use_cotrans: bool):
    """Background task runner"""
    print(f"👉 [Job] Starting OCR job {job_id}")
    try:
        ocr_jobs[job_id]["status"] = "processing"
        ocr_jobs[job_id]["progress"] = 5
        ocr_jobs[job_id]["message"] = "Đang khởi tạo..."
        
        start_time = time.time()
        regions = []
        cleaned_image = None
        engine_used = "none"

        # Define progress callback for local pipeline
        def update_progress(pct: int, msg: str):
            print(f"👉 [Progress] {pct}% - {msg}")
            ocr_jobs[job_id]["progress"] = pct
            ocr_jobs[job_id]["message"] = msg

        # Try Cotrans API first
        if use_cotrans:
            try:
                print("👉 [Job] Trying Cotrans API...")
                ocr_jobs[job_id]["message"] = "Đang gửi yêu cầu Cotrans..."
                # Cotrans doesn't support granular progress, jump to 50
                ocr_jobs[job_id]["progress"] = 20
                
                result = await process_with_cotrans(contents, language, target_language)
                regions = result["regions"]
                cleaned_image = result["cleaned_image"]
                print(f"👉 [Job] Cotrans returned {len(regions)} regions")
                
                if regions:
                    engine_used = "cotrans"
                else:
                    print("👉 [Job] Cotrans found no regions, triggering fallback...")
                    
            except Exception as e:
                print(f"❌ [Job] Cotrans failed: {e}")

        # Fallback to Local Pipeline
        if not regions:
            try:
                print("👉 [Job] Running Local Pipeline...")
                # Local pipeline uses the callback
                from app.services.image_processor import get_manga_processor
                processor = get_manga_processor()
                
                # 1. Detect & Clean (with progress updates 10-90%)
                region_dicts, cleaned_img_cv = processor.process(contents, update_progress)
                
                # 2. Finalize
                update_progress(90, "Đang mã hóa ảnh kết quả...")
                _, buffer = cv2.imencode('.png', cleaned_img_cv)
                cleaned_image_b64 = base64.b64encode(buffer).decode('utf-8')
                
                # 3. OCR on Original Crops
                update_progress(95, "Đang OCR từng vùng...")
                from app.services.manga_ocr_service import recognize_manga_text
                from PIL import Image
                import io
                
                original_pil = Image.open(io.BytesIO(contents)).convert('RGB')
                final_regions = []
                
                for r in region_dicts:
                    bbox = r['bounding_box']
                    x, y, w, h = bbox['x'], bbox['y'], bbox['width'], bbox['height']
                    crop = original_pil.crop((x, y, x + w, y + h))
                    try:
                        text = recognize_manga_text(crop)
                        if text:
                            final_regions.append(TextRegion(
                                id=r['id'],
                                text=text,
                                confidence=90.0,
                                bounding_box=r['bounding_box']
                            ))
                    except: pass
                
                regions = final_regions
                cleaned_image = f"data:image/png;base64,{cleaned_image_b64}"
                engine_used = "local_advanced"
                
            except Exception as e:
                logger.error(f"Local pipeline failed: {e}")
                if engine_used == "none":
                    raise e

        # Completion
        processing_time = (time.time() - start_time) * 1000
        response = OCRResponse(
            success=True,
            regions=regions,
            language=language,
            processing_time_ms=processing_time,
            engine=engine_used,
            message=f"{len(regions)} regions detected",
            cleaned_image=cleaned_image
        )
        
        ocr_jobs[job_id]["result"] = response
        ocr_jobs[job_id]["status"] = "completed"
        ocr_jobs[job_id]["progress"] = 100
        ocr_jobs[job_id]["message"] = "Hoàn tất!"
        
    except Exception as e:
        logger.error(f"Job failed: {e}")
        ocr_jobs[job_id]["status"] = "failed"
        ocr_jobs[job_id]["error"] = str(e)



@router.post("/detect", response_model=JobStatusResponse)
async def start_detect_job(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: str = Form("jpn"),
    target_language: str = Form("vie"),
    use_cotrans: bool = Form(True),
):
    """
    Start an async OCR job. Returns job_id to poll status.
    """
    job_id = str(uuid.uuid4())
    contents = await file.read()
    
    # Initialize job in store
    ocr_jobs[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "progress": 0,
        "message": "Đang xếp hàng...",
        "created_at": time.time()
    }
    
    # Start background task
    background_tasks.add_task(
        run_ocr_job, 
        job_id, 
        contents, 
        language, 
        target_language, 
        use_cotrans
    )
    
    return JobStatusResponse(
        job_id=job_id,
        status="pending",
        progress=0,
        message="Job started"
    )


@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Get status of an OCR job"""
    job = ocr_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # If completed, return result and maybe cleanup (optional cleanup logic omitted for simplicity)
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        progress=job["progress"],
        message=job["message"],
        result=job.get("result"),
        error=job.get("error")
    )



@router.get("/status")
async def get_ocr_status():
    """Check status"""
    return {"status": "online", "mode": "advanced_hybrid"}


@router.get("/languages")
async def get_supported_languages():
    return {
        "languages": [
            {"code": "jpn", "name": "Japanese", "native": "日本語"},
            {"code": "kor", "name": "Korean", "native": "한국어"},
            {"code": "chi_sim", "name": "Chinese (Simplified)", "native": "简体中文"},
            {"code": "eng", "name": "English", "native": "English"},
            {"code": "vie", "name": "Vietnamese", "native": "Tiếng Việt"},
        ]
    }
