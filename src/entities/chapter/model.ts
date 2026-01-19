/**
 * Chapter Store (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chapter, ChapterListItem, ChapterNavigation, ReadingProgress } from './types';
import { chapterApi } from './api';

interface ChapterState {
    // State
    chapters: ChapterListItem[];
    currentChapter: Chapter | null;
    navigation: ChapterNavigation | null;
    readingProgress: Map<string, ReadingProgress>;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchChapters: (comicSlug: string) => Promise<void>;
    fetchChapter: (comicSlug: string, chapterSlug: string) => Promise<void>;
    fetchNavigation: (comicSlug: string, chapterSlug: string) => Promise<void>;
    updateProgress: (chapterId: string, currentPage: number, totalPages: number) => void;
    getProgress: (comicId: string) => ReadingProgress | undefined;
    clearCurrentChapter: () => void;
    clearError: () => void;
}

export const useChapterStore = create<ChapterState>()(
    persist(
        (set, get) => ({
            chapters: [],
            currentChapter: null,
            navigation: null,
            readingProgress: new Map(),
            isLoading: false,
            error: null,

            fetchChapters: async (comicSlug: string) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await chapterApi.getByComicSlug(comicSlug);
                    set({ chapters: response.data, isLoading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch chapters',
                        isLoading: false,
                    });
                }
            },

            fetchChapter: async (comicSlug: string, chapterSlug: string) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await chapterApi.getChapter(comicSlug, chapterSlug);
                    set({ currentChapter: response.data, isLoading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch chapter',
                        isLoading: false,
                    });
                }
            },

            fetchNavigation: async (comicSlug: string, chapterSlug: string) => {
                try {
                    const response = await chapterApi.getNavigation(comicSlug, chapterSlug);
                    set({ navigation: response.data });
                } catch (error) {
                    console.error('Failed to fetch navigation:', error);
                }
            },

            updateProgress: (chapterId: string, currentPage: number, totalPages: number) => {
                const chapter = get().currentChapter;
                if (!chapter) return;

                const progress: ReadingProgress = {
                    chapterId,
                    comicId: chapter.comicId,
                    currentPage,
                    totalPages,
                    percentage: Math.round((currentPage / totalPages) * 100),
                    lastReadAt: new Date().toISOString(),
                };

                const newProgress = new Map(get().readingProgress);
                newProgress.set(chapter.comicId, progress);
                set({ readingProgress: newProgress });

                // Also update on server (non-blocking)
                chapterApi.updateProgress(chapterId, currentPage).catch(console.error);
            },

            getProgress: (comicId: string) => {
                return get().readingProgress.get(comicId);
            },

            clearCurrentChapter: () => {
                set({ currentChapter: null, navigation: null });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'mangahub-reading-progress',
            partialize: (state) => ({
                readingProgress: Array.from(state.readingProgress.entries()),
            }),
            merge: (persisted, current) => ({
                ...current,
                readingProgress: new Map(
                    (persisted as { readingProgress: [string, ReadingProgress][] })?.readingProgress || []
                ),
            }),
        }
    )
);
