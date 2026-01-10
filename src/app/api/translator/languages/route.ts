// ===========================================
// LANGUAGES API ROUTE
// GET /api/translator/languages
// ===========================================

import { NextRequest } from 'next/server'
import { LanguagesResponse } from '@/lib/types/api.types'
import { SUPPORTED_LANGUAGES } from '@/lib/constants/translator.constants'
import { createSuccessResponse } from '@/lib/server/utils/errorHandler'
import { translatorConfig } from '@/lib/server/config/translatorConfig'

export async function GET(request: NextRequest) {
    if (translatorConfig.debug) {
        console.log('[API] GET /api/translator/languages')
    }

    // All supported languages
    const languages = SUPPORTED_LANGUAGES

    // OCR supported languages (Tesseract)
    const ocrSupported = SUPPORTED_LANGUAGES.map((l) => l.code)

    // Translation supported languages
    const translationSupported = SUPPORTED_LANGUAGES.map((l) => l.code)

    const response: LanguagesResponse = {
        languages,
        ocrSupported,
        translationSupported,
    }

    return createSuccessResponse(response)
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
