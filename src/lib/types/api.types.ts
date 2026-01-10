// ===========================================
// API TYPES - Request/Response Definitions
// ===========================================

import { TextRegion, BubbleRegion, SupportedLanguage, LanguageOption } from './translator.types'

// ============ Common Types ============

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: ApiError
}

export interface ApiError {
    code: string
    message: string
    details?: Record<string, unknown>
}

// ============ OCR API ============

export interface OcrRequest {
    language: SupportedLanguage
}

export interface OcrResponse {
    regions: TextRegion[]
    confidence: number
    processingTime: number
}

// ============ Translation API ============

export interface TranslateRequest {
    texts: string[]
    from: SupportedLanguage
    to: SupportedLanguage
}

export interface TranslateResponse {
    translations: {
        original: string
        translated: string
    }[]
    processingTime: number
}

// ============ Process Image API ============

export interface ProcessImageRequest {
    bubbles: BubbleRegion[]
    options?: {
        fontFamily?: string
        fontSize?: number
        fontWeight?: string
        textColor?: string
    }
}

export interface ProcessImageResponse {
    imageUrl: string
    processingTime: number
}

// ============ Languages API ============

export interface LanguagesResponse {
    languages: LanguageOption[]
    ocrSupported: SupportedLanguage[]
    translationSupported: SupportedLanguage[]
}

// ============ Upload Limits ============

export const UPLOAD_LIMITS = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxWidth: 4000,
    maxHeight: 6000,
} as const
