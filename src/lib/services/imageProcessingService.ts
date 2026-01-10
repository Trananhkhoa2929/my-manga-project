// ===========================================
// IMAGE PROCESSING SERVICE
// Text detection, removal, and replacement
// ===========================================

import { v4 as uuidv4 } from 'uuid'
import {
    BubbleRegion,
    TextRegion,
    BoundingBox,
    TextRenderOptions
} from '@/lib/types/translator.types'

// Default text rendering options
const DEFAULT_TEXT_OPTIONS: TextRenderOptions = {
    fontFamily: '"Comic Sans MS", "Noto Sans JP", Arial, sans-serif',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    verticalAlign: 'middle',
    isVertical: false,
    lineHeight: 1.2,
}

class ImageProcessingService {
    /**
     * Create canvas from image element
     */
    createCanvasFromImage(image: HTMLImageElement): HTMLCanvasElement {
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth || image.width
        canvas.height = image.naturalHeight || image.height

        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.drawImage(image, 0, 0)
        }

        return canvas
    }

    /**
     * Load image from URL or File
     */
    loadImage(source: string | File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'

            img.onload = () => resolve(img)
            img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`))

            if (source instanceof File) {
                img.src = URL.createObjectURL(source)
            } else {
                img.src = source
            }
        })
    }

    /**
     * Detect potential bubble regions using edge detection
     * This is a simplified detection - for production, use ML models
     */
    detectBubbleRegions(
        canvas: HTMLCanvasElement,
        textRegions: TextRegion[]
    ): BubbleRegion[] {
        const bubbles: BubbleRegion[] = []

        // Group nearby text regions into bubbles
        const grouped = this.groupTextRegions(textRegions)

        grouped.forEach((group) => {
            // Calculate bounding box for the group
            const minX = Math.min(...group.map(r => r.boundingBox.x))
            const minY = Math.min(...group.map(r => r.boundingBox.y))
            const maxX = Math.max(...group.map(r => r.boundingBox.x + r.boundingBox.width))
            const maxY = Math.max(...group.map(r => r.boundingBox.y + r.boundingBox.height))

            // Add padding around text
            const padding = 10
            const boundingBox: BoundingBox = {
                x: Math.max(0, minX - padding),
                y: Math.max(0, minY - padding),
                width: Math.min(canvas.width - minX + padding, maxX - minX + padding * 2),
                height: Math.min(canvas.height - minY + padding, maxY - minY + padding * 2),
            }

            // Get background color from region
            const backgroundColor = this.detectBubbleColor(canvas, boundingBox)

            // Combine text from all regions in group
            const combinedText = group.map(r => r.text).join(' ')

            bubbles.push({
                id: uuidv4(),
                boundingBox,
                shape: 'ellipse',
                backgroundColor,
                textRegions: group,
                originalText: combinedText,
            })
        })

        return bubbles
    }

    /**
     * Group text regions that are close together
     */
    private groupTextRegions(regions: TextRegion[]): TextRegion[][] {
        if (regions.length === 0) return []

        const grouped: TextRegion[][] = []
        const used = new Set<string>()

        const isNearby = (r1: TextRegion, r2: TextRegion, threshold = 50): boolean => {
            const centerX1 = r1.boundingBox.x + r1.boundingBox.width / 2
            const centerY1 = r1.boundingBox.y + r1.boundingBox.height / 2
            const centerX2 = r2.boundingBox.x + r2.boundingBox.width / 2
            const centerY2 = r2.boundingBox.y + r2.boundingBox.height / 2

            const distance = Math.sqrt(
                Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
            )

            return distance < threshold
        }

        regions.forEach((region) => {
            if (used.has(region.id)) return

            const group: TextRegion[] = [region]
            used.add(region.id)

            // Find all nearby regions
            regions.forEach((other) => {
                if (used.has(other.id)) return

                if (group.some(r => isNearby(r, other))) {
                    group.push(other)
                    used.add(other.id)
                }
            })

            grouped.push(group)
        })

        return grouped
    }

    /**
     * Detect the background color of a bubble region
     */
    private detectBubbleColor(canvas: HTMLCanvasElement, region: BoundingBox): string {
        const ctx = canvas.getContext('2d')
        if (!ctx) return '#FFFFFF'

        // Sample colors from corners of the region
        const samplePoints = [
            { x: region.x + 2, y: region.y + 2 },
            { x: region.x + region.width - 2, y: region.y + 2 },
            { x: region.x + 2, y: region.y + region.height - 2 },
            { x: region.x + region.width - 2, y: region.y + region.height - 2 },
        ]

        let r = 0, g = 0, b = 0
        let count = 0

        samplePoints.forEach(point => {
            if (point.x >= 0 && point.x < canvas.width &&
                point.y >= 0 && point.y < canvas.height) {
                const pixel = ctx.getImageData(point.x, point.y, 1, 1).data
                r += pixel[0]
                g += pixel[1]
                b += pixel[2]
                count++
            }
        })

        if (count === 0) return '#FFFFFF'

        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    /**
     * Remove text from bubble regions by filling with background color
     */
    removeTextFromBubbles(
        canvas: HTMLCanvasElement,
        bubbles: BubbleRegion[]
    ): HTMLCanvasElement {
        const ctx = canvas.getContext('2d')
        if (!ctx) return canvas

        bubbles.forEach((bubble) => {
            const { x, y, width, height } = bubble.boundingBox

            // Fill with bubble background color
            ctx.fillStyle = bubble.backgroundColor

            if (bubble.shape === 'ellipse') {
                ctx.beginPath()
                ctx.ellipse(
                    x + width / 2,
                    y + height / 2,
                    width / 2,
                    height / 2,
                    0, 0, Math.PI * 2
                )
                ctx.fill()
            } else {
                ctx.fillRect(x, y, width, height)
            }
        })

        return canvas
    }

    /**
     * Render translated text onto canvas
     */
    renderTextOnCanvas(
        canvas: HTMLCanvasElement,
        bubbles: BubbleRegion[],
        options: Partial<TextRenderOptions> = {}
    ): HTMLCanvasElement {
        const ctx = canvas.getContext('2d')
        if (!ctx) return canvas

        const opts = { ...DEFAULT_TEXT_OPTIONS, ...options }

        bubbles.forEach((bubble) => {
            const text = bubble.translatedText || bubble.originalText || ''
            if (!text) return

            const { x, y, width, height } = bubble.boundingBox
            const padding = 5

            // Calculate font size to fit text in bubble
            const maxWidth = width - padding * 2
            const maxHeight = height - padding * 2

            let fontSize = opts.fontSize
            ctx.font = `${opts.fontWeight} ${fontSize}px ${opts.fontFamily}`

            // Auto-size font to fit
            const words = text.split(/\s+/)
            let lines = this.wrapText(ctx, text, maxWidth)

            while (lines.length * fontSize * opts.lineHeight > maxHeight && fontSize > 8) {
                fontSize -= 1
                ctx.font = `${opts.fontWeight} ${fontSize}px ${opts.fontFamily}`
                lines = this.wrapText(ctx, text, maxWidth)
            }

            // Draw text
            ctx.fillStyle = opts.color
            ctx.textAlign = opts.textAlign
            ctx.textBaseline = 'top'

            const lineHeight = fontSize * opts.lineHeight
            const totalTextHeight = lines.length * lineHeight

            let startY = y + padding
            if (opts.verticalAlign === 'middle') {
                startY = y + (height - totalTextHeight) / 2
            } else if (opts.verticalAlign === 'bottom') {
                startY = y + height - totalTextHeight - padding
            }

            let textX = x + padding
            if (opts.textAlign === 'center') {
                textX = x + width / 2
            } else if (opts.textAlign === 'right') {
                textX = x + width - padding
            }

            lines.forEach((line, index) => {
                ctx.fillText(line, textX, startY + index * lineHeight)
            })
        })

        return canvas
    }

    /**
     * Wrap text to fit within width
     */
    private wrapText(
        ctx: CanvasRenderingContext2D,
        text: string,
        maxWidth: number
    ): string[] {
        const words = text.split(/\s+/)
        const lines: string[] = []
        let currentLine = ''

        words.forEach((word) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word
            const metrics = ctx.measureText(testLine)

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine)
                currentLine = word
            } else {
                currentLine = testLine
            }
        })

        if (currentLine) {
            lines.push(currentLine)
        }

        return lines
    }

    /**
     * Export canvas as Blob
     */
    async exportAsBlob(
        canvas: HTMLCanvasElement,
        format: 'image/png' | 'image/jpeg' = 'image/png',
        quality = 0.95
    ): Promise<Blob> {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob)
                    } else {
                        reject(new Error('Failed to export canvas as blob'))
                    }
                },
                format,
                quality
            )
        })
    }

    /**
     * Export canvas as data URL
     */
    exportAsDataURL(
        canvas: HTMLCanvasElement,
        format: 'image/png' | 'image/jpeg' = 'image/png',
        quality = 0.95
    ): string {
        return canvas.toDataURL(format, quality)
    }
}

// Export singleton instance
export const imageProcessingService = new ImageProcessingService()
export default imageProcessingService
