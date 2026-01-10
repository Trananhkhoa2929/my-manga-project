// ===========================================
// TRANSLATE API ROUTE
// POST /api/translator/translate
// ===========================================

import { NextRequest } from 'next/server'
import { TranslateRequest, TranslateResponse } from '@/lib/types/api.types'
import { translationServerService } from '@/lib/server/services/translationServerService'
import {
    handleApiError,
    createSuccessResponse,
    createError
} from '@/lib/server/utils/errorHandler'
import {
    validateLanguageOrThrow,
    validateTextsForTranslation,
    parseJsonBody
} from '@/lib/server/utils/validation'
import { translatorConfig } from '@/lib/server/config/translatorConfig'

export async function POST(request: NextRequest) {
    try {
        if (translatorConfig.debug) {
            console.log('[API] POST /api/translator/translate')
        }

        // Parse request body
        const body = await parseJsonBody<TranslateRequest>(request)

        // Validate languages
        const from = validateLanguageOrThrow(body.from)
        const to = validateLanguageOrThrow(body.to)

        // Validate texts
        const textsValidation = validateTextsForTranslation(body.texts)
        if (!textsValidation.valid) {
            throw textsValidation.error
        }

        const texts = textsValidation.sanitized!

        if (translatorConfig.debug) {
            console.log(`[API] Translating ${texts.length} texts from ${from} to ${to}`)
        }

        // Perform translation
        const result = await translationServerService.batchTranslate(texts, from, to)

        if (translatorConfig.debug) {
            console.log(`[API] Translation completed in ${result.processingTime}ms`)
        }

        return createSuccessResponse<TranslateResponse>(result)
    } catch (error) {
        return handleApiError(error)
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
