// ===========================================
// IMAGE PREPROCESSING UTILITIES
// Enhanced OCR for manga pages
// ===========================================

export interface PreprocessOptions {
    enhanceContrast?: boolean
    contrastLevel?: number // 1.0 - 3.0
    grayscale?: boolean
    binarize?: boolean
    binarizeThreshold?: number // 0 - 255
    denoise?: boolean
}

export interface TileConfig {
    tileHeight: number
    overlap: number
}

export interface TileInfo {
    canvas: HTMLCanvasElement
    offsetY: number
    index: number
}

export interface TextRegionWithOffset {
    id: string
    boundingBox: {
        x: number
        y: number
        width: number
        height: number
    }
    text: string
    confidence: number
    language?: string
}

// Default preprocessing options optimized for manga
export const DEFAULT_PREPROCESS_OPTIONS: PreprocessOptions = {
    enhanceContrast: true,
    contrastLevel: 1.5,
    grayscale: true,
    binarize: false, // Only enable if needed
    binarizeThreshold: 128,
    denoise: false,
}

// Default tile config for long images
export const DEFAULT_TILE_CONFIG: TileConfig = {
    tileHeight: 1200,
    overlap: 150,
}

/**
 * Load an image from URL and return as HTMLImageElement
 */
export async function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = url
    })
}

/**
 * Convert image URL to canvas
 */
export async function imageToCanvas(imageUrl: string): Promise<HTMLCanvasElement> {
    const img = await loadImage(imageUrl)
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    return canvas
}

/**
 * Convert canvas to grayscale
 */
export function toGrayscale(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
        // Luminosity method for better results
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        data[i] = gray     // R
        data[i + 1] = gray // G
        data[i + 2] = gray // B
        // Alpha stays the same
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
}

/**
 * Enhance contrast of canvas
 */
export function enhanceContrast(canvas: HTMLCanvasElement, level: number = 1.5): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Clamp level between 0.5 and 3.0
    const contrast = Math.max(0.5, Math.min(3.0, level))
    const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100))

    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
}

/**
 * Apply adaptive binarization (black and white)
 */
export function binarize(canvas: HTMLCanvasElement, threshold: number = 128): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
        const bw = gray > threshold ? 255 : 0
        data[i] = bw
        data[i + 1] = bw
        data[i + 2] = bw
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
}

/**
 * Simple denoise using box blur (reduces noise but may blur text slightly)
 */
export function denoise(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const width = canvas.width
    const height = canvas.height

    // Create copy of data
    const copy = new Uint8ClampedArray(data)

    // 3x3 box blur kernel
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4 + c
                        sum += copy[idx]
                    }
                }
                data[(y * width + x) * 4 + c] = sum / 9
            }
        }
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
}

/**
 * Apply all preprocessing steps
 */
export function preprocessCanvas(
    canvas: HTMLCanvasElement,
    options: PreprocessOptions = DEFAULT_PREPROCESS_OPTIONS
): HTMLCanvasElement {
    // Create a copy to avoid modifying original
    const processed = document.createElement('canvas')
    processed.width = canvas.width
    processed.height = canvas.height
    const ctx = processed.getContext('2d')!
    ctx.drawImage(canvas, 0, 0)

    // Apply preprocessing in order
    if (options.grayscale) {
        toGrayscale(processed)
    }

    if (options.enhanceContrast) {
        enhanceContrast(processed, options.contrastLevel || 1.5)
    }

    if (options.denoise) {
        denoise(processed)
    }

    if (options.binarize) {
        binarize(processed, options.binarizeThreshold || 128)
    }

    return processed
}

/**
 * Preprocess image from URL
 */
export async function preprocessForOCR(
    imageUrl: string,
    options: PreprocessOptions = DEFAULT_PREPROCESS_OPTIONS
): Promise<HTMLCanvasElement> {
    const canvas = await imageToCanvas(imageUrl)
    return preprocessCanvas(canvas, options)
}

/**
 * Check if image is "long" and needs tiling
 */
export function needsTiling(canvas: HTMLCanvasElement, maxHeight: number = 2000): boolean {
    return canvas.height > maxHeight
}

/**
 * Split canvas into overlapping tiles for OCR
 */
export function splitIntoTiles(
    canvas: HTMLCanvasElement,
    config: TileConfig = DEFAULT_TILE_CONFIG
): TileInfo[] {
    const { tileHeight, overlap } = config
    const tiles: TileInfo[] = []
    const effectiveHeight = tileHeight - overlap

    let offsetY = 0
    let index = 0

    while (offsetY < canvas.height) {
        const height = Math.min(tileHeight, canvas.height - offsetY)

        const tileCanvas = document.createElement('canvas')
        tileCanvas.width = canvas.width
        tileCanvas.height = height

        const ctx = tileCanvas.getContext('2d')!
        ctx.drawImage(
            canvas,
            0, offsetY, canvas.width, height,  // Source
            0, 0, canvas.width, height          // Destination
        )

        tiles.push({
            canvas: tileCanvas,
            offsetY,
            index,
        })

        offsetY += effectiveHeight
        index++

        // Safety check to prevent infinite loop
        if (index > 50) break
    }

    return tiles
}

/**
 * Merge OCR results from tiles, adjusting coordinates
 * and removing duplicates from overlap regions
 */
export function mergeTileResults(
    tileResults: { regions: TextRegionWithOffset[], offsetY: number }[],
    overlap: number = 150
): TextRegionWithOffset[] {
    const allRegions: TextRegionWithOffset[] = []

    for (const { regions, offsetY } of tileResults) {
        for (const region of regions) {
            // Adjust Y coordinate to original image space
            const adjustedRegion: TextRegionWithOffset = {
                ...region,
                boundingBox: {
                    ...region.boundingBox,
                    y: region.boundingBox.y + offsetY,
                },
            }

            // Check for duplicates in overlap region
            const isDuplicate = allRegions.some((existing) => {
                const overlapThreshold = overlap / 2
                const yDiff = Math.abs(existing.boundingBox.y - adjustedRegion.boundingBox.y)
                const xDiff = Math.abs(existing.boundingBox.x - adjustedRegion.boundingBox.x)
                const textSimilar = existing.text.trim() === adjustedRegion.text.trim()

                return yDiff < overlapThreshold && xDiff < 50 && textSimilar
            })

            if (!isDuplicate) {
                allRegions.push(adjustedRegion)
            }
        }
    }

    // Sort by Y position (top to bottom)
    return allRegions.sort((a, b) => a.boundingBox.y - b.boundingBox.y)
}

/**
 * Get canvas as data URL for OCR processing
 */
export function canvasToDataURL(canvas: HTMLCanvasElement, mimeType: string = 'image/png'): string {
    return canvas.toDataURL(mimeType, 0.95)
}

/**
 * Calculate optimal tile configuration based on image dimensions
 */
export function calculateTileConfig(height: number): TileConfig {
    if (height <= 2000) {
        return { tileHeight: height, overlap: 0 }
    }

    // For very long images, use larger tiles with more overlap
    if (height > 5000) {
        return { tileHeight: 1500, overlap: 200 }
    }

    return DEFAULT_TILE_CONFIG
}
