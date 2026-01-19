import { NextResponse } from 'next/server';
import { db } from '@shared/lib';
import { SeriesStatus, SeriesType, Visibility } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type') as SeriesType | undefined;
        const status = searchParams.get('status') as SeriesStatus | undefined;
        const search = searchParams.get('q');
        const sort = searchParams.get('sort') || 'latest'; // latest, views, rating, followers
        const featured = searchParams.get('featured') === 'true';
        const genre = searchParams.get('genre');

        const skip = (page - 1) * limit;

        const where: any = {
            visibility: Visibility.PUBLIC,
        };

        if (type) where.type = type;
        if (status) where.status = status;
        if (featured) {
            // Featured = high views + recent updates
            where.stats = { totalViews: { gte: 0 } };
        }
        if (genre) {
            where.genres = {
                some: {
                    genre: { slug: genre }
                }
            };
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { titleOriginal: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Determine sort order
        let orderBy: any = { updatedAt: 'desc' };
        if (sort === 'views') {
            orderBy = { stats: { totalViews: 'desc' } };
        } else if (sort === 'rating') {
            orderBy = { stats: { ratingAvg: 'desc' } };
        } else if (sort === 'followers') {
            orderBy = { stats: { followersCount: 'desc' } };
        } else if (sort === 'latest') {
            orderBy = { updatedAt: 'desc' };
        }

        const [comics, total] = await Promise.all([
            db.series.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    coverUrl: true,
                    bannerUrl: true,
                    type: true,
                    status: true,
                    author: true,
                    description: true,
                    updatedAt: true,
                    stats: {
                        select: {
                            ratingAvg: true,
                            totalViews: true,
                            followersCount: true,
                            chaptersCount: true,
                        }
                    },
                    genres: {
                        select: {
                            genre: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true
                                }
                            }
                        }
                    },
                    chapters: {
                        take: 3,
                        orderBy: { number: 'desc' },
                        where: { isPublished: true },
                        select: {
                            id: true,
                            number: true,
                            slug: true,
                            publishedAt: true,
                        }
                    }
                },
                skip,
                take: limit,
                orderBy
            }),
            db.series.count({ where })
        ]);

        // Transform data to match frontend expectation
        const data = comics.map(comic => ({
            id: comic.id,
            title: comic.title,
            slug: comic.slug,
            thumbnail: comic.coverUrl || '/placeholder.jpg',
            coverImage: comic.bannerUrl || comic.coverUrl || '/placeholder.jpg',
            type: comic.type,
            status: comic.status,
            authors: comic.author ? [comic.author] : [],
            description: comic.description || '',
            rating: Number(comic.stats?.ratingAvg || 0),
            totalViews: Number(comic.stats?.totalViews || 0),
            followers: comic.stats?.followersCount || 0,
            chaptersCount: comic.stats?.chaptersCount || 0,
            genres: comic.genres.map(g => ({
                id: String(g.genre.id),
                name: g.genre.name,
                slug: g.genre.slug
            })),
            lastUpdated: comic.updatedAt.toISOString(),
            latestChapters: comic.chapters.map(ch => ({
                id: ch.id,
                number: Number(ch.number),
                slug: ch.slug,
                updatedAt: ch.publishedAt?.toISOString() || comic.updatedAt.toISOString(),
            })),
        }));

        return NextResponse.json({
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching comics:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: String(error) },
            { status: 500 }
        );
    }
}
