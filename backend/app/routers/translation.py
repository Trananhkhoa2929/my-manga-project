"""
Translation Router
Translate text between languages
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx
import logging
import asyncio

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/translate", tags=["Translation"])

# Language code mapping
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
    confidence: Optional[float] = None


class TranslationResponse(BaseModel):
    success: bool
    translations: List[TranslatedText]
    source_lang: str
    target_lang: str
    message: Optional[str] = None


async def translate_with_mymemory(text: str, from_lang: str, to_lang: str) -> str:
    """Translate using MyMemory API (free tier)"""
    if not text.strip():
        return text
    
    try:
        url = "https://api.mymemory.translated.net/get"
        params = {
            "q": text,
            "langpair": f"{from_lang}|{to_lang}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30.0)
            data = response.json()
            
            if data.get("responseStatus") == 200:
                return data["responseData"]["translatedText"]
            else:
                logger.warning(f"MyMemory error: {data.get('responseDetails')}")
                return text
                
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return text


@router.post("/batch", response_model=TranslationResponse)
async def translate_texts(request: TranslationRequest):
    """
    Translate multiple text strings.
    
    Args:
        texts: List of strings to translate
        source_lang: Source language code (jpn, kor, chi_sim, eng, etc.)
        target_lang: Target language code
    
    Returns:
        List of original and translated text pairs
    """
    try:
        from_lang = LANG_MAP.get(request.source_lang, request.source_lang)
        to_lang = LANG_MAP.get(request.target_lang, request.target_lang)
        
        logger.info(f"Translating {len(request.texts)} texts from {from_lang} to {to_lang}")
        
        # Translate all texts concurrently
        tasks = [
            translate_with_mymemory(text, from_lang, to_lang)
            for text in request.texts
        ]
        
        translated_texts = await asyncio.gather(*tasks)
        
        translations = [
            TranslatedText(
                original=original,
                translated=translated,
            )
            for original, translated in zip(request.texts, translated_texts)
        ]
        
        return TranslationResponse(
            success=True,
            translations=translations,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
            message=f"Translated {len(translations)} texts",
        )
        
    except Exception as e:
        logger.error(f"Translation batch error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.post("/single")
async def translate_single(
    text: str,
    source_lang: str = "jpn",
    target_lang: str = "vie",
):
    """
    Translate a single text string.
    """
    from_lang = LANG_MAP.get(source_lang, source_lang)
    to_lang = LANG_MAP.get(target_lang, target_lang)
    
    translated = await translate_with_mymemory(text, from_lang, to_lang)
    
    return {
        "original": text,
        "translated": translated,
        "source_lang": source_lang,
        "target_lang": target_lang,
    }


@router.get("/languages")
async def get_translation_languages():
    """Get supported translation languages"""
    return {
        "source_languages": [
            {"code": "jpn", "name": "Japanese", "native": "日本語"},
            {"code": "kor", "name": "Korean", "native": "한국어"},
            {"code": "chi_sim", "name": "Chinese (Simplified)", "native": "简体中文"},
            {"code": "chi_tra", "name": "Chinese (Traditional)", "native": "繁體中文"},
            {"code": "eng", "name": "English", "native": "English"},
        ],
        "target_languages": [
            {"code": "vie", "name": "Vietnamese", "native": "Tiếng Việt"},
            {"code": "eng", "name": "English", "native": "English"},
            {"code": "jpn", "name": "Japanese", "native": "日本語"},
            {"code": "kor", "name": "Korean", "native": "한국어"},
            {"code": "chi_sim", "name": "Chinese (Simplified)", "native": "简体中文"},
        ],
    }
