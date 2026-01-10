// ===========================================
// VALIDATION UTILITIES
// Input validation for API requests
// ===========================================

import { PROCESSING_LIMITS, SUPPORTED_LANGUAGES } from '@/lib/constants/translator.constants'
import { SupportedLanguage, BubbleRegion } from '@/lib/types/translator.types'
import { createError } from './errorHandler'

// ============ File Validation ============

export interface FileValidationResult {
    valid: boolean
    error?: ReturnType<typeof createError.invalidFileType | typeof createError.fileTooLarge>
}

export function validateImageFile(file: File): FileValidationResult {
    // Check file type
    if (!PROCESSING_LIMITS.allowedMimeTypes.includes(file.type)) {
        return {
            valid: false,
            error: createError.invalidFileType(PROCESSING_LIMITS.allowedMimeTypes),
        }
    }

    // Check file size
    if (file.size > PROCESSING_LIMITS.maxFileSize) {
        return {
            valid: false,
            error: createError.fileTooLarge(PROCESSING_LIMITS.maxFileSize, file.size),
        }
    }

    return { valid: true }
}

export function validateImageBuffer(
    buffer: Buffer,
    mimeType: string
): FileValidationResult {
    // Check mime type
    if (!PROCESSING_LIMITS.allowedMimeTypes.includes(mimeType)) {
        return {
            valid: false,
            error: createError.invalidFileType(PROCESSING_LIMITS.allowedMimeTypes),
        }
    }

    // Check file size
    if (buffer.length > PROCESSING_LIMITS.maxFileSize) {
        return {
            valid: false,
            error: createError.fileTooLarge(PROCESSING_LIMITS.maxFileSize, buffer.length),
        }
    }

    return { valid: true }
}

// ============ Language Validation ============

export function validateLanguage(language: string): language is SupportedLanguage {
    return SUPPORTED_LANGUAGES.some((lang) => lang.code === language)
}

export function validateLanguageOrThrow(language: string): SupportedLanguage {
    if (!validateLanguage(language)) {
        throw createError.invalidLanguage(
            language,
            SUPPORTED_LANGUAGES.map((l) => l.code)
        )
    }
    return language as SupportedLanguage
}

// ============ Text Validation ============

export interface TextValidationResult {
    valid: boolean
    sanitized?: string[]
    error?: ReturnType<typeof createError.invalidInput>
}

export function validateTextsForTranslation(texts: unknown): TextValidationResult {
    // Check if array
    if (!Array.isArray(texts)) {
        return {
            valid: false,
            error: createError.invalidInput('texts must be an array'),
        }
    }

    // Check if empty
    if (texts.length === 0) {
        return {
            valid: false,
            error: createError.invalidInput('texts array cannot be empty'),
        }
    }

    // Check batch size
    if (texts.length > PROCESSING_LIMITS.maxTextsPerBatch) {
        return {
            valid: false,
            error: createError.invalidInput(
                `Too many texts. Maximum: ${PROCESSING_LIMITS.maxTextsPerBatch}`,
                { maxTexts: PROCESSING_LIMITS.maxTextsPerBatch, actual: texts.length }
            ),
        }
    }

    // Validate and sanitize each text
    const sanitized: string[] = []
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i]

        if (typeof text !== 'string') {
            return {
                valid: false,
                error: createError.invalidInput(`texts[${i}] must be a string`),
            }
        }

        const trimmed = text.trim()

        if (trimmed.length > PROCESSING_LIMITS.maxTextLength) {
            return {
                valid: false,
                error: createError.invalidInput(
                    `texts[${i}] exceeds maximum length of ${PROCESSING_LIMITS.maxTextLength}`,
                    { maxLength: PROCESSING_LIMITS.maxTextLength, actual: trimmed.length }
                ),
            }
        }

        sanitized.push(trimmed)
    }

    return { valid: true, sanitized }
}

// ============ Bubble Validation ============

export function validateBubbles(bubbles: unknown): bubbles is BubbleRegion[] {
    if (!Array.isArray(bubbles)) {
        return false
    }

    return bubbles.every((bubble) => {
        if (typeof bubble !== 'object' || bubble === null) return false

        const b = bubble as Record<string, unknown>

        // Check required fields
        if (typeof b.id !== 'string') return false
        if (typeof b.boundingBox !== 'object' || b.boundingBox === null) return false

        const box = b.boundingBox as Record<string, unknown>
        if (typeof box.x !== 'number') return false
        if (typeof box.y !== 'number') return false
        if (typeof box.width !== 'number') return false
        if (typeof box.height !== 'number') return false

        return true
    })
}

// ============ Request Body Parser ============

export async function parseJsonBody<T>(request: Request): Promise<T> {
    try {
        return await request.json() as T
    } catch {
        throw createError.invalidInput('Invalid JSON body')
    }
}

export async function parseFormData(request: Request): Promise<FormData> {
    try {
        return await request.formData()
    } catch {
        throw createError.invalidInput('Invalid form data')
    }
}
