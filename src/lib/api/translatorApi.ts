// ===========================================
// TRANSLATOR API CLIENT
// Frontend API wrapper for translator endpoints
// ===========================================

import {
    OcrResponse,
    TranslateResponse,
    LanguagesResponse
} from '@/lib/types/api.types'
import { SupportedLanguage, BubbleRegion } from '@/lib/types/translator.types'
import { API_ENDPOINTS } from '@/lib/constants/translator.constants'
import {
    apiGet,
    apiPost,
    apiPostFormData,
    apiPostFormDataBlob,
    withRetry
} from './apiClient'

// ============ Translator API Class ============

class TranslatorApi {
    /**
     * Perform OCR on an image
     */
    async performOcr(
        imageFile: File,
        language: SupportedLanguage = 'jpn'
    ): Promise<OcrResponse> {
        const formData = new FormData()
        formData.append('image', imageFile)
        formData.append('language', language)

        return withRetry(() =>
            apiPostFormData<OcrResponse>(API_ENDPOINTS.ocr, formData)
        )
    }

    /**
     * Perform OCR on an image from canvas
     */
    async performOcrFromCanvas(
        canvas: HTMLCanvasElement,
        language: SupportedLanguage = 'jpn'
    ): Promise<OcrResponse> {
        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob)
                    else reject(new Error('Failed to convert canvas to blob'))
                },
                'image/png',
                0.95
            )
        })

        const file = new File([blob], 'image.png', { type: 'image/png' })
        return this.performOcr(file, language)
    }

    /**
     * Translate texts
     */
    async translate(
        texts: string[],
        from: SupportedLanguage,
        to: SupportedLanguage
    ): Promise<TranslateResponse> {
        return withRetry(() =>
            apiPost<TranslateResponse>(API_ENDPOINTS.translate, {
                texts,
                from,
                to,
            })
        )
    }

    /**
     * Translate a single text
     */
    async translateSingle(
        text: string,
        from: SupportedLanguage,
        to: SupportedLanguage
    ): Promise<string> {
        const result = await this.translate([text], from, to)
        return result.translations[0]?.translated || text
    }

    /**
     * Process image with translations
     */
    async processImage(
        imageFile: File,
        bubbles: BubbleRegion[],
        options: {
            format?: 'png' | 'jpeg' | 'webp'
            fontFamily?: string
            fontSize?: number
            fontWeight?: string
            textColor?: string
        } = {}
    ): Promise<Blob> {
        const formData = new FormData()
        formData.append('image', imageFile)
        formData.append('bubbles', JSON.stringify(bubbles))

        if (options.format) {
            formData.append('format', options.format)
        }

        const textOptions: Record<string, unknown> = {}
        if (options.fontFamily) textOptions.fontFamily = options.fontFamily
        if (options.fontSize) textOptions.fontSize = options.fontSize
        if (options.fontWeight) textOptions.fontWeight = options.fontWeight
        if (options.textColor) textOptions.color = options.textColor

        if (Object.keys(textOptions).length > 0) {
            formData.append('options', JSON.stringify(textOptions))
        }

        return apiPostFormDataBlob(API_ENDPOINTS.processImage, formData)
    }

    /**
     * Process image from canvas
     */
    async processImageFromCanvas(
        canvas: HTMLCanvasElement,
        bubbles: BubbleRegion[],
        options: {
            format?: 'png' | 'jpeg' | 'webp'
            fontFamily?: string
            fontSize?: number
            fontWeight?: string
            textColor?: string
        } = {}
    ): Promise<Blob> {
        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob)
                    else reject(new Error('Failed to convert canvas to blob'))
                },
                'image/png',
                0.95
            )
        })

        const file = new File([blob], 'image.png', { type: 'image/png' })
        return this.processImage(file, bubbles, options)
    }

    /**
     * Get supported languages
     */
    async getLanguages(): Promise<LanguagesResponse> {
        return apiGet<LanguagesResponse>(API_ENDPOINTS.languages)
    }
}

// ============ Export Singleton ============

export const translatorApi = new TranslatorApi()
export default translatorApi
