import { NextResponse } from 'next/server';
import { db } from '@shared/lib';

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(request: Request, props: RouteParams) {
    const params = await props.params;
    try {
        const slug = params.slug;

        const comic = await db.series.findUnique({
            where: { slug },
            include: {
                stats: true,
                genres: { include: { genre: true } },
                altTitles: true,
                uploader: { select: { username: true, id: true } },
            }
        });

        if (!comic) {
            return NextResponse.json({ message: 'Comic not found' }, { status: 404 });
        }

        // Get latest chapters
        const latestChapters = await db.chapter.findMany({
            where: { seriesId: comic.id, isPublished: true },
            orderBy: { number: 'desc' },
            take: 5,
            select: {
                id: true,
                number: true,
                title: true,
                slug: true,
                createdAt: true,
                publishedAt: true,
            }
        });

        // Transform response
        const data = {
            id: comic.id,
            title: comic.title,
            titleOriginal: comic.titleOriginal,
            slug: comic.slug,
            thumbnail: comic.coverUrl || '/placeholder.jpg',
            banner: comic.bannerUrl,
            description: comic.description,
            author: comic.author || 'Unknown',
            artist: comic.artist || 'Unknown',
            status: comic.status,
            type: comic.type,
            views: Number(comic.stats?.totalViews || 0),
            rating: Number(comic.stats?.ratingAvg || 0),
            followers: comic.stats?.followersCount || 0,
            genres: comic.genres.map(g => g.genre),
            altTitles: comic.altTitles,
            uploader: comic.uploader,
            latestChapters: latestChapters.map(ch => ({
                id: ch.id,
                number: Number(ch.number),
                title: ch.title,
                slug: ch.slug,
                createdAt: ch.publishedAt?.toISOString() || ch.createdAt.toISOString(),
            }))
        };

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching comic detail:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
