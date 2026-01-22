/**
 * Cloudflare R2 Storage Client
 * 
 * S3-compatible object storage với:
 * - 10GB free storage
 * - Unlimited free egress (bandwidth)
 * - Tích hợp CDN Cloudflare
 * 
 * Setup:
 * 1. Đăng ký Cloudflare: https://dash.cloudflare.com
 * 2. Vào R2 > Create bucket > Đặt tên "mangahub"
 * 3. Settings > R2.dev subdomain > Enable public access
 * 4. Manage R2 API Tokens > Create API Token
 * 5. Thêm credentials vào .env
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// Initialize R2 Client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT || '',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'mangahub';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

/**
 * Upload file lên R2
 * @param key - Đường dẫn file, vd: "series/abc/chapters/xyz/001.webp"
 * @param buffer - Buffer của file
 * @param contentType - MIME type, vd: "image/webp"
 * @returns Public URL của file
 */
export async function uploadToR2(
    key: string,
    buffer: Buffer,
    contentType: string = 'image/webp'
): Promise<string> {
    await r2Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable', // Cache 1 năm
        })
    );

    return getPublicUrl(key);
}

/**
 * Xóa file khỏi R2
 */
export async function deleteFromR2(key: string): Promise<void> {
    await r2Client.send(
        new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        })
    );
}

/**
 * Kiểm tra file có tồn tại không
 */
export async function existsInR2(key: string): Promise<boolean> {
    try {
        await r2Client.send(
            new HeadObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            })
        );
        return true;
    } catch {
        return false;
    }
}

/**
 * Lấy public URL của file
 */
export function getPublicUrl(key: string): string {
    if (!PUBLIC_URL) {
        throw new Error('R2_PUBLIC_URL chưa được cấu hình trong .env');
    }
    return `${PUBLIC_URL}/${key}`;
}

/**
 * Tạo key path cho ảnh page
 * Format: series/{seriesId}/chapters/{chapterId}/{pageNumber}.webp
 */
export function generatePageKey(
    seriesId: string,
    chapterId: string,
    pageNumber: number
): string {
    return `series/${seriesId}/chapters/${chapterId}/${String(pageNumber).padStart(3, '0')}.webp`;
}

/**
 * Tạo key path cho ảnh cover
 */
export function generateCoverKey(seriesId: string): string {
    return `series/${seriesId}/cover.webp`;
}

/**
 * Tạo key path cho ảnh banner
 */
export function generateBannerKey(seriesId: string): string {
    return `series/${seriesId}/banner.webp`;
}

export { r2Client, BUCKET_NAME };
