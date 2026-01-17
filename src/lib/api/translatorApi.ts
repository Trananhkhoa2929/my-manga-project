// ===========================================
// TRANSLATOR API CLIENT
// Frontend API wrapper for translator endpoints
// ===========================================

import {
    OcrResponse,
    TranslateResponse,
    LanguagesResponse,
    JobStatusResponse
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
     * Perform OCR on an image using Python backend (manga-ocr)
     */
    async performOcr(
        imageFile: File,
        language: SupportedLanguage = 'jpn',
        signal?: AbortSignal
    ): Promise<OcrResponse> {
        // 1. Start Job
        const jobResponse = await this.startOcrJob(imageFile, language)

        // 2. Poll until complete
        // Internal polling (no progress callback exposed in this legacy method)
        return new Promise((resolve, reject) => {
            const poll = async () => {
                if (signal?.aborted) {
                    reject(new Error('Aborted'))
                    return
                }

                try {
                    const status = await this.getJobStatus(jobResponse.job_id)

                    if (status.status === 'completed' && status.result) {
                        resolve(status.result)
                    } else if (status.status === 'failed') {
                        reject(new Error(status.error || 'Job failed'))
                    } else {
                        // Check signal again before waiting
                        if (signal?.aborted) {
                            reject(new Error('Aborted'))
                            return
                        }
                        // Continue polling
                        setTimeout(poll, 1000)
                    }
                } catch (error) {
                    reject(error)
                }
            }
            poll()
        })
    }

    /**
     * Start an async OCR job (returns job_id for polling)
     */
    async startOcrJob(
        imageFile: File,
        language: SupportedLanguage = 'jpn',
        targetLanguage: SupportedLanguage = 'vie'
    ): Promise<JobStatusResponse> {
        console.log('🚀 [SDK] startOcrJob called', { fileName: imageFile.name, size: imageFile.size })

        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('language', language)
        formData.append('target_language', targetLanguage)
        formData.append('use_cotrans', 'false')  // Force local pipeline for better inpainting control

        // Hardcode URL to bypass any config issues
        const url = 'http://localhost:8000/api/ocr/detect'
        console.log('📡 [SDK] Sending POST to:', url)

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            })

            console.log('✅ [SDK] Response status:', response.status)

            if (!response.ok) {
                const text = await response.text()
                console.error('❌ [SDK] Error body:', text)
                throw new Error(`Failed to start OCR job: ${response.statusText}`)
            }

            const data = await response.json()
            console.log('📦 [SDK] Job started:', data)
            return data
        } catch (error) {
            console.error('❌ [SDK] Network error:', error)
            throw error
        }
    }

    /**
     * Poll job status (returns current progress and result when complete)
     */
    async getJobStatus(jobId: string): Promise<JobStatusResponse> {
        // Hardcode URL
        const url = `http://localhost:8000/api/ocr/status/${jobId}`
        // Reduce verbose logging for polling
        // console.log('📡 [SDK] Polling status:', url)

        const response = await fetch(url)

        if (!response.ok) {
            console.error('❌ [SDK] Poll failed:', response.statusText)
            throw new Error(`Failed to get job status: ${response.statusText}`)
        }

        return response.json()
    }

    /**
     * Poll until job completes, calling onProgress callback with updates
     */
    async pollUntilComplete(
        jobId: string,
        onProgress: (progress: number, message: string) => void,
        intervalMs: number = 500
    ): Promise<JobStatusResponse> {
        return new Promise((resolve, reject) => {
            const poll = async () => {
                try {
                    const status = await this.getJobStatus(jobId)

                    onProgress(status.progress, status.message)

                    if (status.status === 'completed') {
                        resolve(status)
                    } else if (status.status === 'failed') {
                        reject(new Error(status.error || 'Job failed'))
                    } else {
                        setTimeout(poll, intervalMs)
                    }
                } catch (error) {
                    reject(error)
                }
            }
            poll()
        })
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
