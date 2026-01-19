/**
 * Chapter API endpoints
 */

import { api } from '@shared/api';
import { Chapter, ChapterListItem, ChapterNavigation } from './types';

export const chapterApi = {
    /**
     * Get all chapters of a comic
     */
    getByComicSlug: async (comicSlug: string) => {
        return api.get<ChapterListItem[]>(`/comics/${comicSlug}/chapters`);
    },

    /**
     * Get chapter detail with pages
     */
    getChapter: async (comicSlug: string, chapterSlug: string) => {
        return api.get<Chapter>(`/comics/${comicSlug}/chapters/${chapterSlug}`);
    },

    /**
     * Get chapter navigation (prev/next)
     */
    getNavigation: async (comicSlug: string, chapterSlug: string) => {
        return api.get<ChapterNavigation>(
            `/comics/${comicSlug}/chapters/${chapterSlug}/navigation`
        );
    },

    /**
     * Check if user has access to chapter (for premium chapters)
     */
    checkAccess: async (chapterId: string) => {
        return api.get<{ hasAccess: boolean; reason?: string }>(
            `/chapters/${chapterId}/access`
        );
    },

    /**
     * Increment view count
     */
    incrementView: async (chapterId: string) => {
        return api.post(`/chapters/${chapterId}/view`);
    },

    /**
     * Update reading progress
     */
    updateProgress: async (chapterId: string, currentPage: number) => {
        return api.post(`/chapters/${chapterId}/progress`, { currentPage });
    },

    /**
     * Get reading progress
     */
    getProgress: async (comicId: string) => {
        return api.get<{ chapterId: string; currentPage: number } | null>(
            `/comics/${comicId}/progress`
        );
    },
};
