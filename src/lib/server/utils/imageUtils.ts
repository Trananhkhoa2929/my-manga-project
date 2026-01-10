// ===========================================
// IMAGE UTILITIES - Server-side image processing
// Using Sharp for high performance
// ===========================================

import sharp from 'sharp'

// ============ Image Info ============

export interface ImageInfo {
    width: number
    height: number
    format: string
    size: number
}

export async function getImageInfo(buffer: Buffer): Promise<ImageInfo> {
    const metadata = await sharp(buffer).metadata()

    return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
    }
}

// ============ Image Preprocessing ============

export interface PreprocessOptions {
    maxWidth?: number
    maxHeight?: number
    grayscale?: boolean
    normalize?: boolean
    sharpen?: boolean
}

export async function preprocessImage(
    buffer: Buffer,
    options: PreprocessOptions = {}
): Promise<Buffer> {
    const {
        maxWidth = 2000,
        maxHeight = 3000,
        grayscale = false,
        normalize = true,
        sharpen = true,
    } = options

    let pipeline = sharp(buffer)

    // Resize if needed
    const metadata = await sharp(buffer).metadata()
    if (
        (metadata.width && metadata.width > maxWidth) ||
        (metadata.height && metadata.height > maxHeight)
    ) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
        })
    }

    // Convert to grayscale for better OCR (optional)
    if (grayscale) {
        pipeline = pipeline.grayscale()
    }

    // Normalize contrast
    if (normalize) {
        pipeline = pipeline.normalize()
    }

    // Sharpen for better text edges
    if (sharpen) {
        pipeline = pipeline.sharpen({ sigma: 1 })
    }

    return pipeline.toBuffer()
}

// ============ Image Conversion ============

export async function convertToFormat(
    buffer: Buffer,
    format: 'png' | 'jpeg' | 'webp',
    quality: number = 90
): Promise<Buffer> {
    const pipeline = sharp(buffer)

    switch (format) {
        case 'png':
            return pipeline.png({ quality }).toBuffer()
        case 'jpeg':
            return pipeline.jpeg({ quality }).toBuffer()
        case 'webp':
            return pipeline.webp({ quality }).toBuffer()
        default:
            return pipeline.png().toBuffer()
    }
}

// ============ Image Region Extraction ============

export interface RegionBounds {
    x: number
    y: number
    width: number
    height: number
}

export async function extractRegion(
    buffer: Buffer,
    region: RegionBounds
): Promise<Buffer> {
    return sharp(buffer)
        .extract({
            left: Math.max(0, Math.round(region.x)),
            top: Math.max(0, Math.round(region.y)),
            width: Math.max(1, Math.round(region.width)),
            height: Math.max(1, Math.round(region.height)),
        })
        .toBuffer()
}

// ============ Fill Region with Color ============

export async function fillRegion(
    buffer: Buffer,
    region: RegionBounds,
    color: string
): Promise<Buffer> {
    const metadata = await sharp(buffer).metadata()
    const width = metadata.width || 0
    const height = metadata.height || 0

    // Create overlay with filled region
    const overlay = await sharp({
        create: {
            width: Math.round(region.width),
            height: Math.round(region.height),
            channels: 4,
            background: color,
        },
    })
        .png()
        .toBuffer()

    return sharp(buffer)
        .composite([
            {
                input: overlay,
                left: Math.max(0, Math.round(region.x)),
                top: Math.max(0, Math.round(region.y)),
            },
        ])
        .toBuffer()
}

// ============ Overlay Text Image ============

export async function overlayTextImage(
    backgroundBuffer: Buffer,
    textBuffer: Buffer,
    x: number,
    y: number
): Promise<Buffer> {
    return sharp(backgroundBuffer)
        .composite([
            {
                input: textBuffer,
                left: Math.max(0, Math.round(x)),
                top: Math.max(0, Math.round(y)),
            },
        ])
        .toBuffer()
}

// ============ Create Text Image ============

export interface TextImageOptions {
    text: string
    width: number
    height: number
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    color?: string
    backgroundColor?: string
    textAlign?: 'left' | 'center' | 'right'
}

export async function createTextImage(options: TextImageOptions): Promise<Buffer> {
    const {
        text,
        width,
        height,
        fontSize = 14,
        fontFamily = 'Arial, sans-serif',
        fontWeight = 'bold',
        color = '#000000',
        backgroundColor = '#FFFFFF',
        textAlign = 'center',
    } = options

    // Create SVG with text
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text
        x="${textAlign === 'left' ? '5%' : textAlign === 'right' ? '95%' : '50%'}"
        y="50%"
        font-family="${fontFamily}"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        fill="${color}"
        text-anchor="${textAlign === 'left' ? 'start' : textAlign === 'right' ? 'end' : 'middle'}"
        dominant-baseline="middle"
      >
        ${escapeXml(text)}
      </text>
    </svg>
  `

    return sharp(Buffer.from(svg)).png().toBuffer()
}

// ============ Helper Functions ============

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

// ============ Detect Dominant Color ============

export async function getDominantColor(buffer: Buffer): Promise<string> {
    const { dominant } = await sharp(buffer).stats()

    const r = Math.round(dominant.r)
    const g = Math.round(dominant.g)
    const b = Math.round(dominant.b)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
