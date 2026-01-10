// ===========================================
// OCR API ROUTE
// POST /api/translator/ocr
// ===========================================

import { NextRequest } from 'next/server'
import { OcrResponse } from '@/lib/types/api.types'
import { ocrServerService } from '@/lib/server/services/ocrServerService'
import {
    handleApiError,
    createSuccessResponse,
    createError
} from '@/lib/server/utils/errorHandler'
import {
    validateImageBuffer,
    validateLanguageOrThrow,
    parseFormData
} from '@/lib/server/utils/validation'
import { translatorConfig } from '@/lib/server/config/translatorConfig'

export async function POST(request: NextRequest) {
    try {
        if (translatorConfig.debug) {
            console.log('[API] POST /api/translator/ocr')
        }

        // Parse form data
        const formData = await parseFormData(request)

        // Get image file
        const imageFile = formData.get('image') as File | null
        if (!imageFile) {
            throw createError.invalidInput('No image file provided')
        }

        // Get language
        const languageParam = formData.get('language') as string || 'jpn'
        const language = validateLanguageOrThrow(languageParam)

        // Convert file to buffer
        const arrayBuffer = await imageFile.arrayBuffer()
        const imageBuffer = Buffer.from(arrayBuffer)

        // Validate image
        const validation = validateImageBuffer(imageBuffer, imageFile.type)
        if (!validation.valid) {
            throw validation.error
        }

        // Perform OCR
        const result = await ocrServerService.recognizeImage(imageBuffer, language)

        if (translatorConfig.debug) {
            console.log(`[API] OCR completed: ${result.regions.length} regions found`)
        }

        return createSuccessResponse<OcrResponse>(result)
    } catch (error) {
        return handleApiError(error)
    }
}

// Optionally handle OPTIONS for CORS
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
