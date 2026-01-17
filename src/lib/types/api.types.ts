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
    cleanedImage?: string | null // Base64 of cleaned image
    jobId?: string
    message?: string
}

export interface JobStatusResponse {
    job_id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    message: string
    result?: OcrResponse // Backend actually returns OCRResponse inside result
    error?: string
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
    maxFileSize: 50 * 1024 * 1024, // 50MB for raw manga scans
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxWidth: 10000,
    maxHeight: 50000, // Long webtoons
} as const
