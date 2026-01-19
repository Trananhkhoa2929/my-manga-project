/**
 * Viewer Store (Zustand)
 * 
 * Manages viewer state: settings, current page, reading mode, etc.
 * Persists settings to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ReadingMode = 'webtoon' | 'paged' | 'rtl';

export interface ViewerSettings {
    readingMode: ReadingMode;
    brightness: number; // 0-100
    zoom: number; // 50-200
    fitMode: 'width' | 'height' | 'original';
    showPageNumber: boolean;
    autoNextChapter: boolean;
}

interface ViewerState {
    // Current reading state
    currentPage: number;
    totalPages: number;
    progress: number;
    isControlsVisible: boolean;
    isFullscreen: boolean;

    // Settings
    settings: ViewerSettings;

    // Actions
    setCurrentPage: (page: number) => void;
    setTotalPages: (total: number) => void;
    setProgress: (progress: number) => void;
    toggleControls: () => void;
    setControlsVisible: (visible: boolean) => void;
    toggleFullscreen: () => void;
    updateSettings: (settings: Partial<ViewerSettings>) => void;
    resetSettings: () => void;

    // Navigation
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
}

const defaultSettings: ViewerSettings = {
    readingMode: 'webtoon',
    brightness: 100,
    zoom: 100,
    fitMode: 'width',
    showPageNumber: true,
    autoNextChapter: true,
};

export const useViewerStore = create<ViewerState>()(
    persist(
        (set, get) => ({
            // Initial state
            currentPage: 1,
            totalPages: 0,
            progress: 0,
            isControlsVisible: true,
            isFullscreen: false,
            settings: defaultSettings,

            // Setters
            setCurrentPage: (page) => set({ currentPage: page }),
            setTotalPages: (total) => set({ totalPages: total }),
            setProgress: (progress) => set({ progress }),

            // Controls visibility
            toggleControls: () =>
                set((state) => ({ isControlsVisible: !state.isControlsVisible })),
            setControlsVisible: (visible) => set({ isControlsVisible: visible }),

            // Fullscreen
            toggleFullscreen: () => {
                const current = get().isFullscreen;
                if (!current) {
                    document.documentElement.requestFullscreen?.();
                } else {
                    document.exitFullscreen?.();
                }
                set({ isFullscreen: !current });
            },

            // Settings
            updateSettings: (newSettings) =>
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                })),
            resetSettings: () => set({ settings: defaultSettings }),

            // Navigation
            nextPage: () => {
                const { currentPage, totalPages } = get();
                if (currentPage < totalPages) {
                    set({ currentPage: currentPage + 1 });
                }
            },
            prevPage: () => {
                const { currentPage } = get();
                if (currentPage > 1) {
                    set({ currentPage: currentPage - 1 });
                }
            },
            goToPage: (page) => {
                const { totalPages } = get();
                if (page >= 1 && page <= totalPages) {
                    set({ currentPage: page });
                }
            },
        }),
        {
            name: 'mangahub-viewer-settings',
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
);
