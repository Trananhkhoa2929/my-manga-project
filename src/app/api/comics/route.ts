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

        const skip = (page - 1) * limit;

        const where: any = {
            visibility: Visibility.PUBLIC,
        };

        if (type) where.type = type;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { titleOriginal: { contains: search, mode: 'insensitive' } },
                { altTitles: { some: { title: { contains: search, mode: 'insensitive' } } } },
            ];
        }

        const [comics, total] = await Promise.all([
            db.series.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    coverUrl: true,
                    type: true,
                    status: true,
                    updatedAt: true,
                    stats: {
                        select: {
                            ratingAvg: true,
                            totalViews: true,
                            followersCount: true,
                        }
                    },
                    genres: {
                        select: {
                            genre: {
                                select: {
                                    name: true,
                                    slug: true
                                }
                            }
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' }
            }),
            db.series.count({ where })
        ]);

        // Transform data to match frontend expectation
        const data = comics.map(comic => ({
            id: comic.id,
            title: comic.title,
            slug: comic.slug,
            thumbnail: comic.coverUrl || '/placeholder.jpg',
            type: comic.type,
            status: comic.status,
            rating: Number(comic.stats?.ratingAvg || 0),
            views: Number(comic.stats?.totalViews || 0),
            genres: comic.genres.map(g => g.genre),
            updatedAt: comic.updatedAt.toISOString(),
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
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
