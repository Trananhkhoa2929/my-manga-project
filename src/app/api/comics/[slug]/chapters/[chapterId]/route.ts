import { NextResponse } from 'next/server';
import { db } from '@shared/lib';

interface RouteParams {
    params: Promise<{ slug: string; chapterId: string }>;
}

export async function GET(request: Request, props: RouteParams) {
    const params = await props.params;

    try {
        const { slug, chapterId } = params;
        console.log('API Chapter: Request for', slug, chapterId);

        // Use findFirst with slug for chapterId if it's a slug, otherwise try ID?
        // The current route is /chap/[chapterId]. In mock, it's parsing number from string.
        // In DB, we have 'slug' field (e.g. 'one-piece-chapter-1').
        // Let's assume frontend passes slug or ID. 
        // The previous code in page.tsx was calling API with `chapterId` but the path was `/chap/[chapterId]`.
        // If we want to support slug navigation:

        // First find series
        const series = await db.series.findUnique({
            where: { slug },
            select: { id: true, slug: true, title: true, coverUrl: true }
        });

        if (!series) {
            return NextResponse.json({ message: 'Series not found' }, { status: 404 });
        }

        // Find chapter
        // Try finding by slug first (assuming chapterId param might be a slug)
        let chapter = await db.chapter.findFirst({
            where: {
                seriesId: series.id,
                slug: chapterId
            },
            include: {
                pages: {
                    orderBy: { pageNumber: 'asc' }
                },
                stats: true
            }
        });

        // If not found by slug, maybe it's "chap-1" format used in mock?
        if (!chapter) {
            // Mock format was "chap-1". Let's try to extract number.
            // But wait, the seed created slug as "one-piece-chapter-1".
            // The reader component passes "one-piece-chapter-1" if using new logic.
            // Let's stick to slug based lookup.
            return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
        }

        // Get nav (prev/next)
        const [prevChapter, nextChapter] = await Promise.all([
            db.chapter.findFirst({
                where: {
                    seriesId: series.id,
                    number: { lt: chapter.number },
                    isPublished: true
                },
                orderBy: { number: 'desc' },
                select: { slug: true }
            }),
            db.chapter.findFirst({
                where: {
                    seriesId: series.id,
                    number: { gt: chapter.number },
                    isPublished: true
                },
                orderBy: { number: 'asc' },
                select: { slug: true }
            })
        ]);

        const data = {
            id: chapter.id,
            number: Number(chapter.number),
            title: chapter.title,
            slug: chapter.slug,
            images: chapter.pages.map(p => ({
                id: p.id,
                page: p.pageNumber,
                src: p.imagePath, // In real app, this should be full URL with CDN.
                // For now, we return path and frontend handles it, or we prefix it.
                // Let's prefix with a base path or just return as is if Imgproxy handles it.
                // The mock returned full URLs. Seed returns 'series/one-piece/ch1/001.webp'.
                // Frontend's ImagePreloader likely needs full URL or can handle relative if base is set.
                // Let's return as is, and we will update ImagePreloader or use API to serve images?
                // Actually, we should probably serve it via a Next.js public route or S3.
                // For dev local, we can assume it's in public folder OR we mock the URL to placeholder service for now
                // if file doesn't exist.
                // WAIT: The user asked to remove mock data. 
                // If I return 'series/...' and file isn't there, it breaks.
                // The seed data uses 'series/one-piece/ch1/001.webp'.
                // I should probably map this to a placeholder service if not found, or trust the seed.
                // Let's just return what is in DB.
                width: p.width || 800,
                height: p.height || 1200,
            })),
            nextChapterSlug: nextChapter?.slug || null,
            prevChapterSlug: prevChapter?.slug || null,
            series: {
                id: series.id,
                slug: series.slug,
                title: series.title,
                thumbnail: series.coverUrl
            }
        };

        return NextResponse.json(data);

    } catch (error) {
        console.error('Chapter API Error:', error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
