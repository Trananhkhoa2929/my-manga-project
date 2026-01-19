/**
 * Chapter Types
 */

export interface Chapter {
    id: string;
    comicId: string;
    number: number;
    title: string;
    slug: string;
    pages: ChapterPage[];
    pageCount: number;
    viewCount: number;
    isPremium: boolean;
    priceCoins?: number;
    status: ChapterStatus;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ChapterListItem {
    id: string;
    number: number;
    title: string;
    slug: string;
    pageCount: number;
    isPremium: boolean;
    priceCoins?: number;
    publishedAt: string | null;
    viewCount: number;
}

export interface ChapterPage {
    id: string;
    number: number;
    imageUrl: string;
    width: number;
    height: number;
}

export type ChapterStatus =
    | 'draft'
    | 'translating'
    | 'editing'
    | 'proofreading'
    | 'published';

export interface ChapterNavigation {
    prev: ChapterListItem | null;
    current: ChapterListItem;
    next: ChapterListItem | null;
}

export interface ReadingProgress {
    chapterId: string;
    comicId: string;
    currentPage: number;
    totalPages: number;
    percentage: number;
    lastReadAt: string;
}
