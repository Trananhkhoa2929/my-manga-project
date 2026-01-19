/**
 * Keyboard Shortcuts Hook
 * 
 * Provides keyboard navigation for the comic viewer.
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useViewerStore } from '@widgets/comic-viewer';

interface KeyboardShortcutsOptions {
    onNextPage?: () => void;
    onPrevPage?: () => void;
    onNextChapter?: () => void;
    onPrevChapter?: () => void;
    onToggleFullscreen?: () => void;
    onToggleControls?: () => void;
    onEscape?: () => void;
    enabled?: boolean;
}

export function useKeyboardShortcuts({
    onNextPage,
    onPrevPage,
    onNextChapter,
    onPrevChapter,
    onToggleFullscreen,
    onToggleControls,
    onEscape,
    enabled = true,
}: KeyboardShortcutsOptions) {
    const { updateSettings, settings } = useViewerStore();

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Ignore if typing in input
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            switch (event.key) {
                // Navigation
                case 'ArrowDown':
                case 'ArrowRight':
                case ' ': // Space
                    event.preventDefault();
                    onNextPage?.();
                    break;

                case 'ArrowUp':
                case 'ArrowLeft':
                    event.preventDefault();
                    onPrevPage?.();
                    break;

                case 'PageDown':
                    event.preventDefault();
                    onNextPage?.();
                    break;

                case 'PageUp':
                    event.preventDefault();
                    onPrevPage?.();
                    break;

                // Chapter navigation
                case '[':
                    event.preventDefault();
                    onPrevChapter?.();
                    break;

                case ']':
                    event.preventDefault();
                    onNextChapter?.();
                    break;

                // Fullscreen
                case 'f':
                case 'F':
                    event.preventDefault();
                    onToggleFullscreen?.();
                    break;

                // Toggle controls
                case 'h':
                case 'H':
                    event.preventDefault();
                    onToggleControls?.();
                    break;

                // Zoom
                case '+':
                case '=':
                    event.preventDefault();
                    updateSettings({ zoom: Math.min(200, settings.zoom + 10) });
                    break;

                case '-':
                case '_':
                    event.preventDefault();
                    updateSettings({ zoom: Math.max(50, settings.zoom - 10) });
                    break;

                case '0':
                    event.preventDefault();
                    updateSettings({ zoom: 100 });
                    break;

                // Escape
                case 'Escape':
                    event.preventDefault();
                    onEscape?.();
                    break;

                default:
                    break;
            }
        },
        [
            enabled,
            onNextPage,
            onPrevPage,
            onNextChapter,
            onPrevChapter,
            onToggleFullscreen,
            onToggleControls,
            onEscape,
            updateSettings,
            settings.zoom,
        ]
    );

    useEffect(() => {
        if (enabled) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [enabled, handleKeyDown]);
}

// Keyboard shortcuts help data
export const KEYBOARD_SHORTCUTS = [
    { key: '↑ ↓ ← →', description: 'Di chuyển trang' },
    { key: 'Space', description: 'Trang tiếp theo' },
    { key: '[ ]', description: 'Chương trước/sau' },
    { key: 'F', description: 'Toàn màn hình' },
    { key: 'H', description: 'Ẩn/Hiện thanh công cụ' },
    { key: '+ -', description: 'Phóng to/Thu nhỏ' },
    { key: '0', description: 'Đặt lại zoom' },
    { key: 'Esc', description: 'Thoát' },
] as const;
