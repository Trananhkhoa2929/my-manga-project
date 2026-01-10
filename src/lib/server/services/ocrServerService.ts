// ===========================================
// OCR SERVER SERVICE
// Server-side OCR processing with Tesseract.js
// ===========================================

import Tesseract, { createWorker, Worker } from 'tesseract.js'
import { v4 as uuidv4 } from 'uuid'
import { TextRegion, SupportedLanguage } from '@/lib/types/translator.types'
import { OcrResponse } from '@/lib/types/api.types'
import { translatorConfig } from '../config/translatorConfig'
import { createError } from '../utils/errorHandler'
import { preprocessImage } from '../utils/imageUtils'

// ============ OCR Service Class ============

class OcrServerService {
    private workers: Map<SupportedLanguage, Worker> = new Map()
    private initPromises: Map<SupportedLanguage, Promise<Worker>> = new Map()

    /**
     * Get or create a worker for the specified language
     */
    private async getWorker(language: SupportedLanguage): Promise<Worker> {
        // Return existing worker
        if (this.workers.has(language)) {
            return this.workers.get(language)!
        }

        // Check if initialization is already in progress
        if (this.initPromises.has(language)) {
            return this.initPromises.get(language)!
        }

        // Create new worker
        const initPromise = this.createWorker(language)
        this.initPromises.set(language, initPromise)

        try {
            const worker = await initPromise
            this.workers.set(language, worker)
            this.initPromises.delete(language)
            return worker
        } catch (error) {
            this.initPromises.delete(language)
            throw error
        }
    }

    /**
     * Create a new Tesseract worker
     */
    private async createWorker(language: SupportedLanguage): Promise<Worker> {
        if (translatorConfig.debug) {
            console.log(`[OCR Server] Creating worker for language: ${language}`)
        }

        const worker = await createWorker(language, 1, {
            logger: translatorConfig.debug
                ? (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`[OCR Server] Progress: ${Math.round(m.progress * 100)}%`)
                    }
                }
                : undefined,
        })

        return worker
    }

    /**
     * Perform OCR on an image buffer
     */
    async recognizeImage(
        imageBuffer: Buffer,
        language: SupportedLanguage
    ): Promise<OcrResponse> {
        const startTime = Date.now()

        try {
            // Preprocess image for better OCR results
            const processedBuffer = await preprocessImage(imageBuffer, {
                normalize: true,
                sharpen: true,
            })

            // Get worker for this language
            const worker = await this.getWorker(language)

            // Perform OCR
            const result = await worker.recognize(processedBuffer)

            // Extract text regions
            const regions: TextRegion[] = result.data.blocks.flatMap((block) =>
                block.paragraphs.flatMap((paragraph) =>
                    paragraph.lines.map((line) => ({
                        id: uuidv4(),
                        boundingBox: {
                            x: line.bbox.x0,
                            y: line.bbox.y0,
                            width: line.bbox.x1 - line.bbox.x0,
                            height: line.bbox.y1 - line.bbox.y0,
                        },
                        text: line.text.trim(),
                        confidence: line.confidence,
                        language,
                    }))
                )
            )

            // Filter out low confidence or empty results
            const filteredRegions = regions.filter(
                (region) => region.text.length > 0 && region.confidence > 30
            )

            const processingTime = Date.now() - startTime

            if (translatorConfig.debug) {
                console.log(`[OCR Server] Completed in ${processingTime}ms, found ${filteredRegions.length} regions`)
            }

            return {
                regions: filteredRegions,
                confidence: result.data.confidence,
                processingTime,
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            throw createError.ocrFailed(errorMessage)
        }
    }

    /**
     * Perform OCR on a specific region of an image
     */
    async recognizeRegion(
        imageBuffer: Buffer,
        region: { x: number; y: number; width: number; height: number },
        language: SupportedLanguage
    ): Promise<OcrResponse> {
        const startTime = Date.now()

        try {
            const worker = await this.getWorker(language)

            const result = await worker.recognize(imageBuffer, {
                rectangle: {
                    left: region.x,
                    top: region.y,
                    width: region.width,
                    height: region.height,
                },
            })

            const regions: TextRegion[] = result.data.words.map((word) => ({
                id: uuidv4(),
                boundingBox: {
                    x: word.bbox.x0,
                    y: word.bbox.y0,
                    width: word.bbox.x1 - word.bbox.x0,
                    height: word.bbox.y1 - word.bbox.y0,
                },
                text: word.text,
                confidence: word.confidence,
                language,
            }))

            return {
                regions,
                confidence: result.data.confidence,
                processingTime: Date.now() - startTime,
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            throw createError.ocrFailed(errorMessage)
        }
    }

    /**
     * Terminate all workers
     */
    async terminateAll(): Promise<void> {
        for (const [lang, worker] of this.workers) {
            await worker.terminate()
            if (translatorConfig.debug) {
                console.log(`[OCR Server] Terminated worker for ${lang}`)
            }
        }
        this.workers.clear()
    }

    /**
     * Terminate worker for specific language
     */
    async terminateWorker(language: SupportedLanguage): Promise<void> {
        const worker = this.workers.get(language)
        if (worker) {
            await worker.terminate()
            this.workers.delete(language)
        }
    }
}

// Export singleton instance
export const ocrServerService = new OcrServerService()
export default ocrServerService
