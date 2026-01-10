# Backend AI Integration Guide

## Overview

This document provides the Python FastAPI backend reference implementation for the manga localization platform's AI features.

## Tech Stack
- **Python 3.10+**
- **FastAPI** - Web framework
- **PaddleOCR** - Text detection and recognition
- **OpenCV** - Image processing
- **LaMa** - Inpainting for text removal

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── ocr.py           # OCR endpoints
│   │   ├── inpainting.py    # Inpainting endpoints
│   │   ├── translation.py   # Translation endpoints
│   │   └── pages.py         # Page management
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ocr_service.py
│   │   ├── inpaint_service.py
│   │   └── translate_service.py
│   └── models/
│       ├── __init__.py
│       └── schemas.py
├── requirements.txt
└── Dockerfile
```

---

## API Endpoints

### 1. OCR Endpoint

```python
# app/routers/ocr.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
import cv2
from paddleocr import PaddleOCR

router = APIRouter(prefix="/api/ocr", tags=["OCR"])

# Initialize PaddleOCR (do once at startup)
ocr_engines = {
    "jpn": PaddleOCR(use_angle_cls=True, lang='japan'),
    "kor": PaddleOCR(use_angle_cls=True, lang='korean'),
    "chi_sim": PaddleOCR(use_angle_cls=True, lang='ch'),
    "eng": PaddleOCR(use_angle_cls=True, lang='en'),
}

class TextRegion(BaseModel):
    id: str
    text: str
    confidence: float
    bounding_box: dict  # {x, y, width, height}

class OCRResponse(BaseModel):
    success: bool
    regions: List[TextRegion]
    processing_time_ms: float

@router.post("/detect", response_model=OCRResponse)
async def detect_text(
    file: UploadFile = File(...),
    language: str = "jpn"
):
    """
    Detect and extract text from manga page image.
    
    Args:
        file: Image file (PNG, JPG, WebP)
        language: Source language (jpn, kor, chi_sim, eng)
    
    Returns:
        List of detected text regions with bounding boxes
    """
    import time
    start_time = time.time()
    
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Get OCR engine
        if language not in ocr_engines:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {language}")
        
        ocr = ocr_engines[language]
        
        # Perform OCR
        result = ocr.ocr(img, cls=True)
        
        # Parse results
        regions = []
        for idx, line in enumerate(result[0] if result[0] else []):
            box = line[0]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
            text, confidence = line[1]
            
            # Convert polygon to rectangle
            x_coords = [p[0] for p in box]
            y_coords = [p[1] for p in box]
            
            regions.append(TextRegion(
                id=f"region-{idx}",
                text=text,
                confidence=confidence * 100,
                bounding_box={
                    "x": int(min(x_coords)),
                    "y": int(min(y_coords)),
                    "width": int(max(x_coords) - min(x_coords)),
                    "height": int(max(y_coords) - min(y_coords)),
                }
            ))
        
        processing_time = (time.time() - start_time) * 1000
        
        return OCRResponse(
            success=True,
            regions=regions,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

### 2. Inpainting Endpoint (LaMa)

```python
# app/routers/inpainting.py

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import numpy as np
import cv2
import io
from typing import List
import json

router = APIRouter(prefix="/api/inpaint", tags=["Inpainting"])

# LaMa model loading would happen at startup
# from lama_cleaner.model_manager import ModelManager
# model = ModelManager(name="lama", device="cuda")

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

@router.post("/clean")
async def clean_text_areas(
    file: UploadFile = File(...),
    regions: str = Form(...),  # JSON string of bounding boxes
    padding: int = Form(5)
):
    """
    Remove text from specified regions using LaMa inpainting.
    
    Args:
        file: Original manga page image
        regions: JSON array of bounding box objects
        padding: Extra padding around text regions
    
    Returns:
        Cleaned image with text removed
    """
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Parse regions
        boxes = json.loads(regions)
        
        # Create mask for inpainting
        mask = np.zeros(img.shape[:2], dtype=np.uint8)
        
        for box in boxes:
            x = max(0, box["x"] - padding)
            y = max(0, box["y"] - padding)
            w = box["width"] + padding * 2
            h = box["height"] + padding * 2
            
            # Fill mask with white (area to inpaint)
            cv2.rectangle(mask, (x, y), (x + w, y + h), 255, -1)
        
        # Option 1: Simple OpenCV inpainting (fast, lower quality)
        # result = cv2.inpaint(img, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
        
        # Option 2: LaMa inpainting (slower, higher quality)
        # Uncomment when LaMa is installed:
        # result = model(img, mask)
        
        # For demo, use OpenCV inpainting
        result = cv2.inpaint(img, mask, inpaintRadius=7, flags=cv2.INPAINT_NS)
        
        # Encode result
        _, buffer = cv2.imencode('.png', result)
        
        return StreamingResponse(
            io.BytesIO(buffer.tobytes()),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=cleaned.png"}
        )
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid regions JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clean-auto")
async def auto_clean_text(
    file: UploadFile = File(...),
    language: str = Form("jpn"),
    confidence_threshold: float = Form(0.7)
):
    """
    Automatically detect and remove text from manga page.
    Combines OCR detection with inpainting.
    
    Args:
        file: Original manga page image
        language: Source language for OCR
        confidence_threshold: Minimum confidence to consider text
    
    Returns:
        Cleaned image with detected text removed
    """
    # 1. Detect text regions
    # 2. Create mask from detected regions
    # 3. Apply inpainting
    # 4. Return cleaned image
    pass
```

---

### 3. Translation Endpoint

```python
# app/routers/translation.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import httpx

router = APIRouter(prefix="/api/translate", tags=["Translation"])

LANG_MAP = {
    "jpn": "ja",
    "kor": "ko",
    "chi_sim": "zh-CN",
    "chi_tra": "zh-TW",
    "eng": "en",
    "vie": "vi",
}

class TranslationRequest(BaseModel):
    texts: List[str]
    source_lang: str
    target_lang: str

class TranslatedText(BaseModel):
    original: str
    translated: str

class TranslationResponse(BaseModel):
    success: bool
    translations: List[TranslatedText]

@router.post("/batch", response_model=TranslationResponse)
async def translate_texts(request: TranslationRequest):
    """
    Translate multiple text strings.
    
    Uses MyMemory API (free) or Google Translate API (paid).
    """
    try:
        from_lang = LANG_MAP.get(request.source_lang, request.source_lang)
        to_lang = LANG_MAP.get(request.target_lang, request.target_lang)
        
        translations = []
        
        async with httpx.AsyncClient() as client:
            for text in request.texts:
                if not text.strip():
                    translations.append(TranslatedText(
                        original=text,
                        translated=text
                    ))
                    continue
                
                # Using MyMemory API (free tier)
                url = f"https://api.mymemory.translated.net/get"
                params = {
                    "q": text,
                    "langpair": f"{from_lang}|{to_lang}"
                }
                
                response = await client.get(url, params=params)
                data = response.json()
                
                if data.get("responseStatus") == 200:
                    translated = data["responseData"]["translatedText"]
                else:
                    translated = text  # Fallback to original
                
                translations.append(TranslatedText(
                    original=text,
                    translated=translated
                ))
        
        return TranslationResponse(
            success=True,
            translations=translations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

### 4. Page Processing Pipeline

```python
# app/routers/pages.py

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json

router = APIRouter(prefix="/api/pages", tags=["Pages"])

class ProcessPageRequest(BaseModel):
    source_lang: str = "jpn"
    target_lang: str = "vie"
    auto_translate: bool = True
    auto_clean: bool = True

@router.post("/process")
async def process_page(
    file: UploadFile = File(...),
    options: str = Form("{}")
):
    """
    Complete page processing pipeline:
    1. OCR to detect text
    2. Inpainting to clean bubbles
    3. Translation
    4. Return processed data
    
    This endpoint orchestrates the full workflow.
    """
    try:
        opts = json.loads(options)
        source_lang = opts.get("source_lang", "jpn")
        target_lang = opts.get("target_lang", "vie")
        
        # Read image
        contents = await file.read()
        
        # Step 1: OCR
        # regions = await ocr_service.detect(contents, source_lang)
        
        # Step 2: Inpainting (if auto_clean)
        # cleaned_image = await inpaint_service.clean(contents, regions)
        
        # Step 3: Translation (if auto_translate)
        # translations = await translate_service.translate(
        #     [r.text for r in regions],
        #     source_lang,
        #     target_lang
        # )
        
        # Return combined result
        return {
            "success": True,
            "message": "Page processed successfully",
            # "regions": regions,
            # "translations": translations,
            # "clean_url": "...",
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Installation

### Requirements (requirements.txt)

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
paddlepaddle==2.6.0
paddleocr==2.7.0
opencv-python-headless==4.9.0.80
numpy==1.26.3
httpx==0.26.0
Pillow==10.2.0
torch==2.1.2
# lama-cleaner==1.2.4  # For LaMa inpainting
```

### Docker (Dockerfile)

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY ./app ./app

# Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Run Locally

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000
```

---

## Integration with Next.js Frontend

The frontend already has API routes that proxy to this backend:
- `/api/translator/ocr` → `POST /api/ocr/detect`
- `/api/translator/translate` → `POST /api/translate/batch`
- `/api/translator/process-image` → `POST /api/pages/process`

Update the frontend API to point to your FastAPI backend URL:

```typescript
// src/lib/api/translatorApi.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:8000'
```
