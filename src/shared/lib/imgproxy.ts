/**
 * Imgproxy Image Loader
 * 
 * Custom image loader for Next.js that generates Imgproxy URLs.
 * Supports automatic WebP/AVIF conversion, resizing, and quality optimization.
 */

import { env } from '@shared/config';

interface ImgproxyOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'png' | 'jpg' | 'auto';
    resize?: 'fit' | 'fill' | 'auto';
    gravity?: 'no' | 'so' | 'ea' | 'we' | 'noea' | 'nowe' | 'soea' | 'sowe' | 'ce' | 'sm';
    blur?: number;
    sharpen?: number;
}

/**
 * Generate Imgproxy URL
 * 
 * @param src Original image URL or S3 path
 * @param options Processing options
 * @returns Imgproxy URL
 */
export function getImgproxyUrl(src: string, options: ImgproxyOptions = {}): string {
    const imgproxyUrl = env.IMGPROXY_URL || 'http://localhost:8080';

    // If imgproxy is not configured, return original URL
    if (!imgproxyUrl || imgproxyUrl === '') {
        return src;
    }

    const {
        width,
        height,
        quality = 80,
        format = 'auto',
        resize = 'fit',
        gravity = 'no',
        blur,
        sharpen,
    } = options;

    // Build processing options string
    const processingOptions: string[] = [];

    // Resize
    if (width || height) {
        const w = width || 0;
        const h = height || 0;
        processingOptions.push(`rs:${resize}:${w}:${h}`);
    }

    // Gravity (for cropping)
    if (gravity !== 'no') {
        processingOptions.push(`g:${gravity}`);
    }

    // Quality
    processingOptions.push(`q:${quality}`);

    // Format
    if (format === 'auto') {
        // Let imgproxy detect best format based on Accept header
        processingOptions.push('f:auto');
    } else {
        processingOptions.push(`f:${format}`);
    }

    // Blur
    if (blur && blur > 0) {
        processingOptions.push(`bl:${blur}`);
    }

    // Sharpen
    if (sharpen && sharpen > 0) {
        processingOptions.push(`sh:${sharpen}`);
    }

    const optionsPath = processingOptions.join('/');

    // Encode source URL
    // For S3: use s3://bucket/path format
    // For HTTP: use plain/url format
    let encodedSrc: string;

    if (src.startsWith('s3://')) {
        // S3 URL - use as is
        encodedSrc = btoa(src).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } else if (src.startsWith('http://') || src.startsWith('https://')) {
        // HTTP URL - encode with plain prefix
        encodedSrc = `plain/${encodeURIComponent(src)}`;
    } else {
        // Relative path - assume S3
        const s3Url = `s3://${env.S3_BUCKET}/${src}`;
        encodedSrc = btoa(s3Url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    // Build final URL (insecure mode for development)
    // In production, use signed URLs
    return `${imgproxyUrl}/insecure/${optionsPath}/${encodedSrc}`;
}

/**
 * Generate responsive image srcset
 */
export function getImgproxySrcSet(
    src: string,
    widths: number[] = [320, 640, 768, 1024, 1280],
    options: Omit<ImgproxyOptions, 'width'> = {}
): string {
    return widths
        .map((width) => {
            const url = getImgproxyUrl(src, { ...options, width });
            return `${url} ${width}w`;
        })
        .join(', ');
}

/**
 * Next.js Image Loader for Imgproxy
 * 
 * Usage:
 * <Image
 *   loader={imgproxyLoader}
 *   src="/path/to/image.jpg"
 *   width={800}
 *   height={600}
 * />
 */
export function imgproxyLoader({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}): string {
    return getImgproxyUrl(src, {
        width,
        quality: quality || 80,
        format: 'auto',
    });
}

/**
 * Get optimized manga page URL
 * 
 * Optimized settings for manga/comic pages
 */
export function getMangaPageUrl(
    src: string,
    containerWidth: number = 900,
    quality: number = 85
): string {
    return getImgproxyUrl(src, {
        width: containerWidth,
        quality,
        format: 'auto',
        resize: 'fit',
    });
}

/**
 * Get thumbnail URL
 * 
 * For cover images and previews
 */
export function getThumbnailUrl(
    src: string,
    width: number = 200,
    height: number = 280
): string {
    return getImgproxyUrl(src, {
        width,
        height,
        quality: 75,
        format: 'webp',
        resize: 'fill',
        gravity: 'no',
    });
}

/**
 * Get blurred placeholder URL
 * 
 * For progressive loading effect
 */
export function getPlaceholderUrl(src: string, size: number = 20): string {
    return getImgproxyUrl(src, {
        width: size,
        quality: 30,
        format: 'webp',
        blur: 5,
    });
}
