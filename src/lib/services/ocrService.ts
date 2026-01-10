// ===========================================
// OCR SERVICE - Text Detection & Extraction
// Using Tesseract.js for OCR
// ===========================================

import Tesseract, { createWorker, Worker } from 'tesseract.js'
import { v4 as uuidv4 } from 'uuid'
import {
    TextRegion,
    BoundingBox,
    OCRResult,
    SupportedLanguage
} from '@/lib/types/translator.types'

class OCRService {
    private worker: Worker | null = null
    private isInitialized = false
    private currentLanguage: SupportedLanguage = 'jpn'

    /**
     * Initialize the OCR worker with specified language
     */
    async initialize(language: SupportedLanguage = 'jpn'): Promise<void> {
        if (this.worker && this.currentLanguage === language) {
            return
        }

        // Terminate existing worker if language changed
        if (this.worker) {
            await this.worker.terminate()
        }

        console.log(`[OCR] Initializing Tesseract with language: ${language}`)

        this.worker = await createWorker(language, 1, {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`)
                }
            },
        })

        this.currentLanguage = language
        this.isInitialized = true
        console.log('[OCR] Initialization complete')
    }

    /**
     * Preprocess image for better OCR results
     */
    preprocessImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
        const ctx = canvas.getContext('2d')
        if (!ctx) return canvas

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

            // Increase contrast
            const contrast = 1.5
            const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100))
            const newGray = Math.min(255, Math.max(0, factor * (gray - 128) + 128))

            data[i] = newGray
            data[i + 1] = newGray
            data[i + 2] = newGray
        }

        ctx.putImageData(imageData, 0, 0)
        return canvas
    }

    /**
     * Extract text from an image
     */
    async extractText(
        imageSource: string | HTMLCanvasElement | HTMLImageElement,
        language: SupportedLanguage = 'jpn'
    ): Promise<OCRResult> {
        await this.initialize(language)

        if (!this.worker) {
            throw new Error('OCR worker not initialized')
        }

        console.log('[OCR] Starting text extraction...')

        const result = await this.worker.recognize(imageSource)

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

        console.log(`[OCR] Extracted ${regions.length} text regions`)

        return {
            text: result.data.text,
            confidence: result.data.confidence,
            regions,
        }
    }

    /**
     * Extract text from a specific region of an image
     */
    async extractTextFromRegion(
        imageSource: string | HTMLCanvasElement | HTMLImageElement,
        region: BoundingBox,
        language: SupportedLanguage = 'jpn'
    ): Promise<OCRResult> {
        await this.initialize(language)

        if (!this.worker) {
            throw new Error('OCR worker not initialized')
        }

        const result = await this.worker.recognize(imageSource, {
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
            text: result.data.text,
            confidence: result.data.confidence,
            regions,
        }
    }

    /**
     * Detect text blocks/paragraphs in an image
     */
    async detectTextBlocks(
        imageSource: string | HTMLCanvasElement | HTMLImageElement,
        language: SupportedLanguage = 'jpn'
    ): Promise<TextRegion[]> {
        await this.initialize(language)

        if (!this.worker) {
            throw new Error('OCR worker not initialized')
        }

        const result = await this.worker.recognize(imageSource)

        // Group words into blocks based on Tesseract's paragraph detection
        const blocks: TextRegion[] = result.data.blocks.map((block) => ({
            id: uuidv4(),
            boundingBox: {
                x: block.bbox.x0,
                y: block.bbox.y0,
                width: block.bbox.x1 - block.bbox.x0,
                height: block.bbox.y1 - block.bbox.y0,
            },
            text: block.text,
            confidence: block.confidence,
            language,
        }))

        return blocks
    }

    /**
     * Clean up - terminate the worker
     */
    async terminate(): Promise<void> {
        if (this.worker) {
            await this.worker.terminate()
            this.worker = null
            this.isInitialized = false
            console.log('[OCR] Worker terminated')
        }
    }
}

// Export singleton instance
export const ocrService = new OCRService()
export default ocrService
