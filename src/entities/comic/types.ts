/**
 * Comic Types
 */

export interface Comic {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    bannerImage?: string;
    author: string;
    artist?: string;
    status: ComicStatus;
    type: ComicType;
    genres: Genre[];
    tags: string[];
    viewCount: number;
    followCount: number;
    ratingAverage: number;
    ratingCount: number;
    chapterCount: number;
    latestChapter?: ChapterSummary;
    createdAt: string;
    updatedAt: string;
}

export interface ComicSummary {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    latestChapter?: ChapterSummary;
    updatedAt: string;
}

export interface ChapterSummary {
    id: string;
    number: number;
    title: string;
    publishedAt: string;
}

export type ComicStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';

export type ComicType = 'manga' | 'manhwa' | 'manhua' | 'webtoon' | 'comic';

export interface Genre {
    id: string;
    name: string;
    slug: string;
}

export interface ComicFilters {
    type?: ComicType;
    status?: ComicStatus;
    genres?: string[];
    sortBy?: 'latest' | 'popular' | 'rating' | 'views' | 'name';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
