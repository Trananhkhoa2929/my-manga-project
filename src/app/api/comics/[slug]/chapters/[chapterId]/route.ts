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
        const chapter = await db.chapter.findFirst({
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

        // R2 Public URL for images
        const r2PublicUrl = process.env.R2_PUBLIC_URL || '';

        const data = {
            id: chapter.id,
            number: Number(chapter.number),
            title: chapter.title,
            slug: chapter.slug,
            images: chapter.pages.map(p => ({
                id: p.id,
                page: p.pageNumber,
                src: p.imagePath
                    ? (p.imagePath.startsWith('http') ? p.imagePath : `${r2PublicUrl}/${p.imagePath}`)
                    : '/placeholder.jpg',
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
