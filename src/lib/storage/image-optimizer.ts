/**
 * Image Optimizer using Sharp
 * 
 * Tối ưu hóa ảnh manga cho web:
 * - Convert sang WebP (size nhỏ hơn 30-50%)
 * - Resize phù hợp mobile/desktop
 * - Giữ chất lượng tốt
 */

import sharp from 'sharp';

interface OptimizeOptions {
    maxWidth?: number;
    quality?: number;
}

/**
 * Tối ưu ảnh cho mobile (mặc định)
 * - Max width: 800px
 * - Quality: 85%
 * - Format: WebP
 */
export async function optimizeForMobile(
    inputBuffer: Buffer,
    options: OptimizeOptions = {}
): Promise<Buffer> {
    const { maxWidth = 800, quality = 85 } = options;

    return sharp(inputBuffer)
        .resize(maxWidth, null, {
            withoutEnlargement: true,
            fit: 'inside',
        })
        .webp({
            quality,
            effort: 4, // Balance giữa speed và compression
        })
        .toBuffer();
}

/**
 * Tối ưu ảnh cho desktop (high quality)
 * - Max width: 1200px
 * - Quality: 90%
 */
export async function optimizeForDesktop(
    inputBuffer: Buffer,
    options: OptimizeOptions = {}
): Promise<Buffer> {
    const { maxWidth = 1200, quality = 90 } = options;

    return sharp(inputBuffer)
        .resize(maxWidth, null, {
            withoutEnlargement: true,
            fit: 'inside',
        })
        .webp({
            quality,
            effort: 6,
        })
        .toBuffer();
}

/**
 * Tạo thumbnail cho cover/preview
 * - Max width: 400px
 * - Quality: 80%
 */
export async function createThumbnail(
    inputBuffer: Buffer,
    options: OptimizeOptions = {}
): Promise<Buffer> {
    const { maxWidth = 400, quality = 80 } = options;

    return sharp(inputBuffer)
        .resize(maxWidth, null, {
            withoutEnlargement: true,
            fit: 'inside',
        })
        .webp({
            quality,
            effort: 4,
        })
        .toBuffer();
}

/**
 * Tối ưu ảnh cover (tỷ lệ 3:4)
 */
export async function optimizeCover(
    inputBuffer: Buffer
): Promise<Buffer> {
    return sharp(inputBuffer)
        .resize(600, 800, {
            fit: 'cover',
            position: 'center',
        })
        .webp({
            quality: 90,
            effort: 6,
        })
        .toBuffer();
}

/**
 * Tối ưu ảnh banner (tỷ lệ rộng)
 */
export async function optimizeBanner(
    inputBuffer: Buffer
): Promise<Buffer> {
    return sharp(inputBuffer)
        .resize(1400, 400, {
            fit: 'cover',
            position: 'center',
        })
        .webp({
            quality: 85,
            effort: 6,
        })
        .toBuffer();
}

/**
 * Lấy metadata của ảnh (width, height, format)
 */
export async function getImageMetadata(inputBuffer: Buffer) {
    const metadata = await sharp(inputBuffer).metadata();
    return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
    };
}

/**
 * Tự động tối ưu dựa vào kích thước màn hình
 */
export async function autoOptimize(
    inputBuffer: Buffer,
    targetWidth: 'mobile' | 'desktop' | 'thumbnail' = 'mobile'
): Promise<Buffer> {
    switch (targetWidth) {
        case 'desktop':
            return optimizeForDesktop(inputBuffer);
        case 'thumbnail':
            return createThumbnail(inputBuffer);
        case 'mobile':
        default:
            return optimizeForMobile(inputBuffer);
    }
}
