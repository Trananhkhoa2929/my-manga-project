/**
 * Comic Store (Zustand)
 */

import { create } from 'zustand';
import { Comic, ComicSummary, ComicFilters } from './types';
import { comicApi } from './api';

interface ComicState {
    // State
    comics: ComicSummary[];
    currentComic: Comic | null;
    trendingComics: ComicSummary[];
    isLoading: boolean;
    error: string | null;
    filters: ComicFilters;
    totalPages: number;
    currentPage: number;

    // Actions
    fetchComics: (filters?: ComicFilters) => Promise<void>;
    fetchComicBySlug: (slug: string) => Promise<void>;
    fetchTrending: () => Promise<void>;
    setFilters: (filters: Partial<ComicFilters>) => void;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    comics: [],
    currentComic: null,
    trendingComics: [],
    isLoading: false,
    error: null,
    filters: {},
    totalPages: 0,
    currentPage: 1,
};

export const useComicStore = create<ComicState>((set, get) => ({
    ...initialState,

    fetchComics: async (filters?: ComicFilters) => {
        try {
            set({ isLoading: true, error: null });
            const mergedFilters = { ...get().filters, ...filters };
            const response = await comicApi.getList(mergedFilters);

            set({
                comics: response.data.data,
                totalPages: response.data.meta.totalPages,
                currentPage: response.data.meta.currentPage,
                filters: mergedFilters,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch comics',
                isLoading: false,
            });
        }
    },

    fetchComicBySlug: async (slug: string) => {
        try {
            set({ isLoading: true, error: null });
            const response = await comicApi.getBySlug(slug);
            set({ currentComic: response.data, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch comic',
                isLoading: false,
            });
        }
    },

    fetchTrending: async () => {
        try {
            const response = await comicApi.getTrending();
            set({ trendingComics: response.data });
        } catch (error) {
            console.error('Failed to fetch trending:', error);
        }
    },

    setFilters: (filters: Partial<ComicFilters>) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
        }));
    },

    clearError: () => set({ error: null }),

    reset: () => set(initialState),
}));
