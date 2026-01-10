// ===========================================
// ERROR HANDLER - Standardized API Errors
// ===========================================

import { NextResponse } from 'next/server'
import { ApiError, ApiResponse } from '@/lib/types/api.types'
import { ERROR_CODES, ErrorCode } from '@/lib/constants/translator.constants'
import { translatorConfig } from '../config/translatorConfig'

// ============ Custom Error Class ============

export class TranslatorError extends Error {
    public code: ErrorCode
    public statusCode: number
    public details?: Record<string, unknown>

    constructor(
        code: ErrorCode,
        message: string,
        statusCode: number = 500,
        details?: Record<string, unknown>
    ) {
        super(message)
        this.name = 'TranslatorError'
        this.code = code
        this.statusCode = statusCode
        this.details = details
    }
}

// ============ Error Factory Functions ============

export const createError = {
    invalidFileType: (allowedTypes: string[]) =>
        new TranslatorError(
            ERROR_CODES.INVALID_FILE_TYPE,
            `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
            400,
            { allowedTypes }
        ),

    fileTooLarge: (maxSize: number, actualSize: number) =>
        new TranslatorError(
            ERROR_CODES.FILE_TOO_LARGE,
            `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
            400,
            { maxSize, actualSize }
        ),

    invalidLanguage: (language: string, supported: string[]) =>
        new TranslatorError(
            ERROR_CODES.INVALID_LANGUAGE,
            `Invalid language: ${language}. Supported: ${supported.join(', ')}`,
            400,
            { language, supported }
        ),

    invalidInput: (message: string, details?: Record<string, unknown>) =>
        new TranslatorError(ERROR_CODES.INVALID_INPUT, message, 400, details),

    ocrFailed: (reason: string) =>
        new TranslatorError(
            ERROR_CODES.OCR_FAILED,
            `OCR processing failed: ${reason}`,
            500
        ),

    translationFailed: (reason: string) =>
        new TranslatorError(
            ERROR_CODES.TRANSLATION_FAILED,
            `Translation failed: ${reason}`,
            500
        ),

    imageProcessingFailed: (reason: string) =>
        new TranslatorError(
            ERROR_CODES.IMAGE_PROCESSING_FAILED,
            `Image processing failed: ${reason}`,
            500
        ),

    internal: (reason: string) =>
        new TranslatorError(ERROR_CODES.INTERNAL_ERROR, reason, 500),

    rateLimited: () =>
        new TranslatorError(
            ERROR_CODES.RATE_LIMITED,
            'Too many requests. Please try again later.',
            429
        ),
}

// ============ Error Response Handler ============

export function handleApiError(error: unknown): NextResponse<ApiResponse<never>> {
    // Log error in debug mode
    if (translatorConfig.debug) {
        console.error('[API Error]', error)
    }

    // Handle known TranslatorError
    if (error instanceof TranslatorError) {
        return NextResponse.json<ApiResponse<never>>(
            {
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                },
            },
            { status: error.statusCode }
        )
    }

    // Handle standard Error
    if (error instanceof Error) {
        return NextResponse.json<ApiResponse<never>>(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_ERROR,
                    message: translatorConfig.debug
                        ? error.message
                        : 'An unexpected error occurred',
                },
            },
            { status: 500 }
        )
    }

    // Handle unknown errors
    return NextResponse.json<ApiResponse<never>>(
        {
            success: false,
            error: {
                code: ERROR_CODES.INTERNAL_ERROR,
                message: 'An unexpected error occurred',
            },
        },
        { status: 500 }
    )
}

// ============ Success Response Handler ============

export function createSuccessResponse<T>(
    data: T,
    status: number = 200
): NextResponse<ApiResponse<T>> {
    return NextResponse.json<ApiResponse<T>>(
        {
            success: true,
            data,
        },
        { status }
    )
}
