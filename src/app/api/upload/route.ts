/**
 * Upload API Route
 * 
 * Endpoints:
 * - POST /api/upload/pages - Upload chapter pages
 * - POST /api/upload/cover - Upload series cover
 * - POST /api/upload/banner - Upload series banner
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@shared/config/auth';
import { db } from '@shared/lib';
import {
    uploadToR2,
    generatePageKey,
    generateCoverKey,
    generateBannerKey,
    optimizeForMobile,
    optimizeCover,
    optimizeBanner,
    getImageMetadata,
} from '@/lib/storage';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * POST /api/upload
 * Upload manga pages for a chapter
 * 
 * FormData:
 * - chapterId: string
 * - pages: File[] (multiple files)
 */
export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const chapterId = formData.get('chapterId') as string;
        const type = formData.get('type') as string || 'pages'; // pages, cover, banner
        const files = formData.getAll('files') as File[];

        if (!files.length) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        // Handle different upload types
        if (type === 'cover' || type === 'banner') {
            return handleCoverBannerUpload(formData, type);
        }

        // Handle pages upload
        if (!chapterId) {
            return NextResponse.json(
                { error: 'chapterId is required for page upload' },
                { status: 400 }
            );
        }

        // Get chapter and series info
        const chapter = await db.chapter.findUnique({
            where: { id: chapterId },
            include: { series: true },
        });

        if (!chapter) {
            return NextResponse.json(
                { error: 'Chapter not found' },
                { status: 404 }
            );
        }

        const uploadedPages: { pageNumber: number; url: string; width: number; height: number }[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File ${file.name} exceeds 10MB limit` },
                    { status: 400 }
                );
            }

            // Convert to buffer
            const buffer = Buffer.from(await file.arrayBuffer());

            // Get original metadata
            const metadata = await getImageMetadata(buffer);

            // Optimize image
            const optimizedBuffer = await optimizeForMobile(buffer);

            // Generate key and upload
            const pageNumber = i + 1;
            const key = generatePageKey(chapter.seriesId, chapterId, pageNumber);
            const url = await uploadToR2(key, optimizedBuffer, 'image/webp');

            // Save to database
            await db.page.upsert({
                where: {
                    chapterId_pageNumber: {
                        chapterId,
                        pageNumber,
                    },
                },
                update: {
                    imagePath: key,
                    width: metadata.width,
                    height: metadata.height,
                    status: 'FINAL',
                },
                create: {
                    chapterId,
                    pageNumber,
                    imagePath: key,
                    width: metadata.width,
                    height: metadata.height,
                    status: 'FINAL',
                },
            });

            uploadedPages.push({
                pageNumber,
                url,
                width: metadata.width,
                height: metadata.height,
            });
        }

        // Update chapter pages count
        await db.chapter.update({
            where: { id: chapterId },
            data: { pagesCount: files.length },
        });

        return NextResponse.json({
            success: true,
            message: `Uploaded ${files.length} pages`,
            pages: uploadedPages,
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * Handle cover/banner upload
 */
async function handleCoverBannerUpload(formData: FormData, type: 'cover' | 'banner') {
    const seriesId = formData.get('seriesId') as string;
    const files = formData.getAll('files') as File[];

    if (!seriesId) {
        return NextResponse.json(
            { error: 'seriesId is required' },
            { status: 400 }
        );
    }

    if (!files.length) {
        return NextResponse.json(
            { error: 'No file provided' },
            { status: 400 }
        );
    }

    const file = files[0];
    const buffer = Buffer.from(await file.arrayBuffer());

    // Optimize based on type
    const optimizedBuffer = type === 'cover'
        ? await optimizeCover(buffer)
        : await optimizeBanner(buffer);

    // Generate key and upload
    const key = type === 'cover'
        ? generateCoverKey(seriesId)
        : generateBannerKey(seriesId);

    const url = await uploadToR2(key, optimizedBuffer, 'image/webp');

    // Update series
    await db.series.update({
        where: { id: seriesId },
        data: {
            [type === 'cover' ? 'coverUrl' : 'bannerUrl']: url,
        },
    });

    return NextResponse.json({
        success: true,
        type,
        url,
    });
}
