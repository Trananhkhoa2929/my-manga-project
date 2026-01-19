import { NextResponse } from 'next/server';
import { db } from '@shared/lib';

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(request: Request, props: RouteParams) {
    const params = await props.params;
    try {
        const { slug } = params;
        
        const series = await db.series.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!series) {
            return NextResponse.json({ message: 'Series not found' }, { status: 404 });
        }

        const chapters = await db.chapter.findMany({
            where: { seriesId: series.id, isPublished: true },
            orderBy: { number: 'desc' },
            select: {
                id: true,
                number: true,
                title: true,
                slug: true,
                createdAt: true,
                publishedAt: true,
            }
        });

        return NextResponse.json(chapters);
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
