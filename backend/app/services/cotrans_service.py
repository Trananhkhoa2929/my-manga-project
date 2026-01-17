"""
Cotrans API Service
Uses the official manga-image-translator cloud API for accurate manga translation
API: api.cotrans.touhou.ai
"""

import logging
import httpx
import base64
from typing import List, Optional
import uuid
import asyncio

logger = logging.getLogger(__name__)

# Cotrans API configuration
COTRANS_API_URL = "https://api.cotrans.touhou.ai"
COTRANS_WEB_URL = "https://cotrans.touhou.ai"

# Supported languages
COTRANS_LANGUAGES = {
    "jpn": "JPN",
    "kor": "KOR", 
    "chi_sim": "CHS",
    "chi_tra": "CHT",
    "eng": "ENG",
    "vie": "VIE",
}

COTRANS_TARGET_LANGUAGES = {
    "vie": "VIE",
    "eng": "ENG",
    "jpn": "JPN",
    "kor": "KOR",
    "chi_sim": "CHS",
}


async def translate_manga_with_cotrans(
    image_bytes: bytes,
    source_lang: str = "jpn",
    target_lang: str = "vie",
    detector: str = "default",
    direction: str = "auto",
    translator: str = "gpt3.5",
    timeout: int = 120
) -> dict:
    """
    Translate manga using Cotrans cloud API.
    
    Args:
        image_bytes: Raw image bytes
        source_lang: Source language code
        target_lang: Target language code  
        detector: Text detector ("default", "ctd", "craft")
        direction: Text direction ("auto", "horizontal", "vertical")
        translator: Translation service
        timeout: Request timeout in seconds
    
    Returns:
        Dict with translated image and detected text regions
    """
    logger.info(f"Calling Cotrans API: {source_lang} -> {target_lang}")
    
    # Convert to base64
    image_base64 = base64.b64encode(image_bytes).decode('utf-8')
    
    # Map language codes
    src_lang = COTRANS_LANGUAGES.get(source_lang, "JPN")
    tgt_lang = COTRANS_TARGET_LANGUAGES.get(target_lang, "VIE")
    
    # Prepare request
    payload = {
        "image": image_base64,
        "source_lang": src_lang,
        "target_lang": tgt_lang,
        "detector": detector,
        "direction": direction,
        "translator": translator,
        "size": "M",  # Medium size for faster processing
    }
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            # Submit translation task
            response = await client.post(
                f"{COTRANS_API_URL}/task/upload",
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"Cotrans API error: {response.status_code}")
                # Try alternative endpoint
                response = await client.post(
                    f"{COTRANS_API_URL}/submit",
                    json=payload
                )
            
            result = response.json()
            
            if "task_id" in result:
                # Poll for result
                task_id = result["task_id"]
                return await poll_cotrans_result(client, task_id, timeout)
            
            return result
            
    except httpx.TimeoutException:
        logger.error("Cotrans API timeout")
        raise Exception("Translation timeout - please try again")
    except Exception as e:
        logger.error(f"Cotrans API error: {e}")
        raise


async def poll_cotrans_result(client: httpx.AsyncClient, task_id: str, timeout: int) -> dict:
    """Poll Cotrans API for translation result"""
    start_time = asyncio.get_event_loop().time()
    
    while True:
        elapsed = asyncio.get_event_loop().time() - start_time
        if elapsed > timeout:
            raise Exception("Translation timeout")
        
        response = await client.get(f"{COTRANS_API_URL}/task/{task_id}/status")
        status = response.json()
        
        if status.get("state") == "finished":
            return status.get("result", {})
        elif status.get("state") == "error":
            raise Exception(status.get("error", "Translation failed"))
        
        await asyncio.sleep(2)


def extract_regions_from_cotrans_result(result: dict, source_lang: str) -> List[dict]:
    """Extract text regions from Cotrans API result"""
    regions = []
    
    text_regions = result.get("text_regions", []) or result.get("textlines", [])
    
    for idx, region in enumerate(text_regions):
        # Handle different response formats
        if isinstance(region, dict):
            text = region.get("text", "") or region.get("src", "")
            translated = region.get("translated", "") or region.get("dst", "")
            bbox = region.get("bbox", region.get("bounding_box", [0, 0, 100, 100]))
            
            if isinstance(bbox, list) and len(bbox) >= 4:
                x, y, x2, y2 = bbox[:4]
                width = x2 - x
                height = y2 - y
            else:
                x, y, width, height = 0, 0, 100, 50
            
            if text:
                regions.append({
                    'id': f'region-{uuid.uuid4().hex[:8]}',
                    'text': text,
                    'translatedText': translated,
                    'confidence': 95.0,
                    'bounding_box': {
                        'x': int(x),
                        'y': int(y),
                        'width': int(width),
                        'height': int(height)
                    }
                })
    
    return regions


async def process_manga_with_cotrans(
    image_bytes: bytes,
    source_lang: str = "jpn",
    target_lang: str = "vie"
) -> dict:
    """
    Main function: Process manga image with Cotrans API.
    Returns OCR regions and optionally translated image.
    """
    try:
        result = await translate_manga_with_cotrans(
            image_bytes,
            source_lang=source_lang,
            target_lang=target_lang
        )
        
        regions = extract_regions_from_cotrans_result(result, source_lang)
        
        return {
            "success": True,
            "regions": regions,
            "translated_image": result.get("translated_image"),
            "engine": "cotrans"
        }
        
    except Exception as e:
        logger.error(f"Cotrans processing failed: {e}")
        return {
            "success": False,
            "regions": [],
            "error": str(e),
            "engine": "cotrans"
        }


def is_cotrans_available() -> bool:
    """Check if Cotrans API is reachable"""
    try:
        import httpx
        response = httpx.get(f"{COTRANS_WEB_URL}", timeout=5)
        return response.status_code == 200
    except:
        return False
