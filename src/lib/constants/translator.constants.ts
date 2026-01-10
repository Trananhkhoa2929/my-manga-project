// ===========================================
// TRANSLATOR CONSTANTS
// Centralized configuration values
// ===========================================

import { LanguageOption, SupportedLanguage } from '@/lib/types/translator.types'

// ============ Language Configuration ============

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
    { code: 'jpn', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'kor', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'chi_sim', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'chi_tra', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
    { code: 'eng', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'vie', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
]

// Tesseract language codes
export const OCR_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
    'jpn': 'jpn',
    'kor': 'kor',
    'chi_sim': 'chi_sim',
    'chi_tra': 'chi_tra',
    'eng': 'eng',
    'vie': 'vie',
}

// Translation API language codes (ISO 639-1)
export const TRANSLATION_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
    'jpn': 'ja',
    'kor': 'ko',
    'chi_sim': 'zh-CN',
    'chi_tra': 'zh-TW',
    'eng': 'en',
    'vie': 'vi',
}

// ============ Processing Limits ============

export const PROCESSING_LIMITS = {
    // Image limits
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxImageWidth: 4000,
    maxImageHeight: 6000,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],

    // OCR limits
    maxOcrRetries: 3,
    ocrTimeout: 60000, // 60 seconds

    // Translation limits
    maxTextsPerBatch: 20,
    maxTextLength: 1000,
    translationTimeout: 30000, // 30 seconds

    // Rate limits
    requestsPerMinute: 30,
    requestsPerHour: 500,
} as const

// ============ Font Configuration ============

export const DEFAULT_FONT_CONFIG = {
    families: [
        'Comic Sans MS',
        'Noto Sans JP',
        'Noto Sans KR',
        'Noto Sans SC',
        'Arial',
        'sans-serif',
    ],
    defaultSize: 14,
    minSize: 8,
    maxSize: 32,
    defaultWeight: '600',
    defaultColor: '#000000',
    lineHeight: 1.3,
} as const

// ============ API Endpoints ============

export const API_ENDPOINTS = {
    ocr: '/api/translator/ocr',
    translate: '/api/translator/translate',
    processImage: '/api/translator/process-image',
    languages: '/api/translator/languages',
} as const

// ============ Error Codes ============

export const ERROR_CODES = {
    // Validation errors
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_LANGUAGE: 'INVALID_LANGUAGE',
    INVALID_INPUT: 'INVALID_INPUT',

    // Processing errors
    OCR_FAILED: 'OCR_FAILED',
    TRANSLATION_FAILED: 'TRANSLATION_FAILED',
    IMAGE_PROCESSING_FAILED: 'IMAGE_PROCESSING_FAILED',

    // Server errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    RATE_LIMITED: 'RATE_LIMITED',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]
