// ===========================================
// IMAGE SERVER SERVICE
// Server-side image processing for manga translation
// ===========================================

import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { BubbleRegion, TextRenderOptions } from '@/lib/types/translator.types'
import { DEFAULT_FONT_CONFIG } from '@/lib/constants/translator.constants'
import { translatorConfig } from '../config/translatorConfig'
import { createError } from '../utils/errorHandler'
import {
    getImageInfo,
    preprocessImage,
    getDominantColor,
    convertToFormat
} from '../utils/imageUtils'

// ============ Image Processing Service ============

class ImageServerService {
    /**
     * Process image: remove original text and add translated text
     */
    async processImageWithTranslations(
        imageBuffer: Buffer,
        bubbles: BubbleRegion[],
        options: Partial<TextRenderOptions> = {}
    ): Promise<Buffer> {
        const startTime = Date.now()

        try {
            if (translatorConfig.debug) {
                console.log(`[Image Server] Processing ${bubbles.length} bubbles`)
            }

            // Get image info
            const imageInfo = await getImageInfo(imageBuffer)

            // Start with the original image
            let processedBuffer = imageBuffer

            // Process each bubble
            for (const bubble of bubbles) {
                if (!bubble.translatedText) continue

                // Fill bubble with background color (remove original text)
                processedBuffer = await this.fillBubbleBackground(
                    processedBuffer,
                    bubble.boundingBox,
                    bubble.backgroundColor || '#FFFFFF'
                )

                // Render translated text
                processedBuffer = await this.renderTextInBubble(
                    processedBuffer,
                    bubble,
                    options
                )
            }

            if (translatorConfig.debug) {
                console.log(`[Image Server] Processed in ${Date.now() - startTime}ms`)
            }

            return processedBuffer
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            throw createError.imageProcessingFailed(errorMessage)
        }
    }

    /**
     * Fill bubble area with background color
     */
    private async fillBubbleBackground(
        imageBuffer: Buffer,
        boundingBox: { x: number; y: number; width: number; height: number },
        backgroundColor: string
    ): Promise<Buffer> {
        const { x, y, width, height } = boundingBox

        // Create a filled rectangle overlay
        const overlay = await sharp({
            create: {
                width: Math.max(1, Math.round(width)),
                height: Math.max(1, Math.round(height)),
                channels: 4,
                background: backgroundColor,
            },
        })
            .png()
            .toBuffer()

        return sharp(imageBuffer)
            .composite([
                {
                    input: overlay,
                    left: Math.max(0, Math.round(x)),
                    top: Math.max(0, Math.round(y)),
                },
            ])
            .toBuffer()
    }

    /**
     * Render text inside a bubble
     */
    private async renderTextInBubble(
        imageBuffer: Buffer,
        bubble: BubbleRegion,
        options: Partial<TextRenderOptions>
    ): Promise<Buffer> {
        const { boundingBox, translatedText } = bubble
        if (!translatedText) return imageBuffer

        const padding = 8
        const textWidth = Math.max(1, boundingBox.width - padding * 2)
        const textHeight = Math.max(1, boundingBox.height - padding * 2)

        // Calculate optimal font size
        const fontSize = this.calculateOptimalFontSize(
            translatedText,
            textWidth,
            textHeight,
            options.fontSize || DEFAULT_FONT_CONFIG.defaultSize
        )

        // Determine text color based on background
        const textColor = options.color || this.getContrastColor(bubble.backgroundColor || '#FFFFFF')

        // Create SVG with text
        const textSvg = this.createTextSvg(
            translatedText,
            Math.round(textWidth),
            Math.round(textHeight),
            {
                fontSize,
                fontFamily: options.fontFamily || DEFAULT_FONT_CONFIG.families.join(', '),
                fontWeight: options.fontWeight || DEFAULT_FONT_CONFIG.defaultWeight,
                color: textColor,
                textAlign: options.textAlign || 'center',
                lineHeight: DEFAULT_FONT_CONFIG.lineHeight,
            }
        )

        const textBuffer = await sharp(Buffer.from(textSvg))
            .png()
            .toBuffer()

        return sharp(imageBuffer)
            .composite([
                {
                    input: textBuffer,
                    left: Math.max(0, Math.round(boundingBox.x + padding)),
                    top: Math.max(0, Math.round(boundingBox.y + padding)),
                },
            ])
            .toBuffer()
    }

    /**
     * Calculate optimal font size to fit text in area
     */
    private calculateOptimalFontSize(
        text: string,
        width: number,
        height: number,
        startSize: number
    ): number {
        // Estimate characters per line based on width
        const avgCharWidth = startSize * 0.6
        const charsPerLine = Math.floor(width / avgCharWidth)

        // Estimate number of lines needed
        const words = text.split(/\s+/)
        let lines = 1
        let currentLineLength = 0

        for (const word of words) {
            if (currentLineLength + word.length > charsPerLine) {
                lines++
                currentLineLength = word.length
            } else {
                currentLineLength += word.length + 1
            }
        }

        // Calculate max font size that fits
        const lineHeight = DEFAULT_FONT_CONFIG.lineHeight
        const maxHeight = height / (lines * lineHeight)

        return Math.min(
            startSize,
            Math.max(DEFAULT_FONT_CONFIG.minSize, Math.floor(maxHeight))
        )
    }

    /**
     * Get contrasting text color based on background
     */
    private getContrastColor(backgroundColor: string): string {
        // Parse hex color
        const hex = backgroundColor.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16) || 255
        const g = parseInt(hex.substring(2, 4), 16) || 255
        const b = parseInt(hex.substring(4, 6), 16) || 255

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

        // Return black for light backgrounds, white for dark
        return luminance > 0.5 ? '#000000' : '#FFFFFF'
    }

    /**
     * Create SVG with wrapped text
     */
    private createTextSvg(
        text: string,
        width: number,
        height: number,
        options: {
            fontSize: number
            fontFamily: string
            fontWeight: string
            color: string
            textAlign: 'left' | 'center' | 'right'
            lineHeight: number
        }
    ): string {
        const { fontSize, fontFamily, fontWeight, color, textAlign, lineHeight } = options

        // Wrap text into lines
        const lines = this.wrapText(text, width, fontSize)
        const actualLineHeight = fontSize * lineHeight
        const totalTextHeight = lines.length * actualLineHeight

        // Calculate starting Y position for vertical centering
        const startY = Math.max(fontSize, (height - totalTextHeight) / 2 + fontSize)

        // Calculate X position based on alignment
        let textAnchor = 'middle'
        let xPos = width / 2
        if (textAlign === 'left') {
            textAnchor = 'start'
            xPos = 0
        } else if (textAlign === 'right') {
            textAnchor = 'end'
            xPos = width
        }

        // Build text elements
        const textElements = lines
            .map(
                (line, i) => `
        <tspan x="${xPos}" dy="${i === 0 ? 0 : actualLineHeight}">
          ${this.escapeXml(line)}
        </tspan>
      `
            )
            .join('')

        return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text
          x="${xPos}"
          y="${startY}"
          font-family="${fontFamily}"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${color}"
          text-anchor="${textAnchor}"
        >
          ${textElements}
        </text>
      </svg>
    `
    }

    /**
     * Wrap text into lines that fit within width
     */
    private wrapText(text: string, width: number, fontSize: number): string[] {
        const avgCharWidth = fontSize * 0.55
        const maxCharsPerLine = Math.max(1, Math.floor(width / avgCharWidth))

        const words = text.split(/\s+/)
        const lines: string[] = []
        let currentLine = ''

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word

            if (testLine.length > maxCharsPerLine && currentLine) {
                lines.push(currentLine)
                currentLine = word
            } else {
                currentLine = testLine
            }
        }

        if (currentLine) {
            lines.push(currentLine)
        }

        return lines
    }

    /**
     * Escape XML special characters
     */
    private escapeXml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
    }

    /**
     * Export processed image
     */
    async exportImage(
        imageBuffer: Buffer,
        format: 'png' | 'jpeg' | 'webp' = 'png',
        quality: number = translatorConfig.image.exportQuality
    ): Promise<Buffer> {
        return convertToFormat(imageBuffer, format, quality)
    }

    /**
     * Detect bubble background colors
     */
    async detectBubbleColors(
        imageBuffer: Buffer,
        bubbles: BubbleRegion[]
    ): Promise<BubbleRegion[]> {
        const updatedBubbles: BubbleRegion[] = []

        for (const bubble of bubbles) {
            const { x, y, width, height } = bubble.boundingBox

            try {
                // Extract bubble region
                const regionBuffer = await sharp(imageBuffer)
                    .extract({
                        left: Math.max(0, Math.round(x)),
                        top: Math.max(0, Math.round(y)),
                        width: Math.max(1, Math.round(width)),
                        height: Math.max(1, Math.round(height)),
                    })
                    .toBuffer()

                // Get dominant color
                const backgroundColor = await getDominantColor(regionBuffer)

                updatedBubbles.push({
                    ...bubble,
                    backgroundColor,
                })
            } catch {
                // If extraction fails, use default white
                updatedBubbles.push({
                    ...bubble,
                    backgroundColor: '#FFFFFF',
                })
            }
        }

        return updatedBubbles
    }
}

// Export singleton instance
export const imageServerService = new ImageServerService()
export default imageServerService
