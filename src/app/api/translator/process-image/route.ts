// ===========================================
// PROCESS IMAGE API ROUTE
// POST /api/translator/process-image
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import { BubbleRegion } from '@/lib/types/translator.types'
import { imageServerService } from '@/lib/server/services/imageServerService'
import {
    handleApiError,
    createError
} from '@/lib/server/utils/errorHandler'
import {
    validateImageBuffer,
    validateBubbles,
    parseFormData
} from '@/lib/server/utils/validation'
import { translatorConfig } from '@/lib/server/config/translatorConfig'

export async function POST(request: NextRequest) {
    try {
        if (translatorConfig.debug) {
            console.log('[API] POST /api/translator/process-image')
        }

        // Parse form data
        const formData = await parseFormData(request)

        // Get image file
        const imageFile = formData.get('image') as File | null
        if (!imageFile) {
            throw createError.invalidInput('No image file provided')
        }

        // Get bubbles data
        const bubblesJson = formData.get('bubbles') as string | null
        if (!bubblesJson) {
            throw createError.invalidInput('No bubbles data provided')
        }

        let bubbles: BubbleRegion[]
        try {
            bubbles = JSON.parse(bubblesJson)
        } catch {
            throw createError.invalidInput('Invalid bubbles JSON')
        }

        // Validate bubbles
        if (!validateBubbles(bubbles)) {
            throw createError.invalidInput('Invalid bubble structure')
        }

        // Get optional format
        const format = (formData.get('format') as 'png' | 'jpeg' | 'webp') || 'png'

        // Get optional text options
        const optionsJson = formData.get('options') as string | null
        let textOptions = {}
        if (optionsJson) {
            try {
                textOptions = JSON.parse(optionsJson)
            } catch {
                // Ignore invalid options
            }
        }

        // Convert file to buffer
        const arrayBuffer = await imageFile.arrayBuffer()
        const imageBuffer = Buffer.from(arrayBuffer)

        // Validate image
        const validation = validateImageBuffer(imageBuffer, imageFile.type)
        if (!validation.valid) {
            throw validation.error
        }

        if (translatorConfig.debug) {
            console.log(`[API] Processing image with ${bubbles.length} bubbles`)
        }

        // Detect bubble colors if not provided
        const bubblesWithColors = await imageServerService.detectBubbleColors(
            imageBuffer,
            bubbles
        )

        // Process image
        const processedBuffer = await imageServerService.processImageWithTranslations(
            imageBuffer,
            bubblesWithColors,
            textOptions
        )

        // Export to requested format
        const exportedBuffer = await imageServerService.exportImage(
            processedBuffer,
            format
        )

        // Return image as response
        const mimeType = format === 'jpeg' ? 'image/jpeg' :
            format === 'webp' ? 'image/webp' : 'image/png'

        return new NextResponse(exportedBuffer, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Length': exportedBuffer.length.toString(),
                'Content-Disposition': `attachment; filename="translated.${format}"`,
            },
        })
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
