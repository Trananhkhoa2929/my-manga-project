/**
 * Viewer Controls Component
 * 
 * Floating controls for the comic viewer: navigation, settings, zoom, etc.
 */

'use client';

import { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Settings,
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    List,
    Sun,
    X,
} from 'lucide-react';
import { cn } from '@shared/lib';
import { useViewerStore, type ReadingMode } from '../model/viewerStore';

interface ViewerControlsProps {
    comicTitle?: string;
    chapterTitle?: string;
    onBack?: () => void;
    onChapterList?: () => void;
    onPrevChapter?: () => void;
    onNextChapter?: () => void;
    hasPrevChapter?: boolean;
    hasNextChapter?: boolean;
    className?: string;
}

export function ViewerControls({
    comicTitle,
    chapterTitle,
    onBack,
    onChapterList,
    onPrevChapter,
    onNextChapter,
    hasPrevChapter = false,
    hasNextChapter = false,
    className,
}: ViewerControlsProps) {
    const [showSettings, setShowSettings] = useState(false);

    const {
        currentPage,
        totalPages,
        progress,
        isControlsVisible,
        isFullscreen,
        settings,
        toggleControls,
        toggleFullscreen,
        updateSettings,
        goToPage,
    } = useViewerStore();

    if (!isControlsVisible) {
        return (
            <div
                className="fixed inset-0 z-40"
                onClick={toggleControls}
                aria-hidden="true"
            />
        );
    }

    return (
        <>
            {/* Backdrop to toggle controls */}
            <div
                className="fixed inset-0 z-40"
                onClick={toggleControls}
                aria-hidden="true"
            />

            {/* Top Bar */}
            <div
                className={cn(
                    'fixed top-0 left-0 right-0 z-50',
                    'bg-gradient-to-b from-black/80 to-transparent',
                    'px-4 py-3 flex items-center gap-4',
                    'animate-in slide-in-from-top duration-200',
                    className
                )}
            >
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Quay lại"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                {/* Title */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-white font-medium truncate">
                        {comicTitle}
                    </h1>
                    <p className="text-gray-400 text-sm truncate">
                        {chapterTitle}
                    </p>
                </div>

                {/* Actions */}
                <button
                    onClick={onChapterList}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Danh sách chương"
                >
                    <List className="w-5 h-5 text-white" />
                </button>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Cài đặt"
                >
                    <Settings className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Bottom Bar */}
            <div
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-50',
                    'bg-gradient-to-t from-black/80 to-transparent',
                    'px-4 py-3',
                    'animate-in slide-in-from-bottom duration-200'
                )}
            >
                {/* Progress Bar */}
                <div className="mb-3">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                    {/* Prev Chapter */}
                    <button
                        onClick={onPrevChapter}
                        disabled={!hasPrevChapter}
                        className={cn(
                            'p-2 rounded-lg transition-colors',
                            hasPrevChapter
                                ? 'hover:bg-white/10 text-white'
                                : 'text-gray-600 cursor-not-allowed'
                        )}
                        aria-label="Chương trước"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Page Info & Slider */}
                    <div className="flex-1 flex items-center justify-center gap-4">
                        <span className="text-white text-sm whitespace-nowrap">
                            {currentPage} / {totalPages}
                        </span>

                        <input
                            type="range"
                            min={1}
                            max={totalPages || 1}
                            value={currentPage}
                            onChange={(e) => goToPage(parseInt(e.target.value))}
                            className="w-32 sm:w-48 accent-purple-500"
                        />
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => updateSettings({ zoom: Math.max(50, settings.zoom - 10) })}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            aria-label="Thu nhỏ"
                        >
                            <ZoomOut className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-white text-xs w-10 text-center">
                            {settings.zoom}%
                        </span>
                        <button
                            onClick={() => updateSettings({ zoom: Math.min(200, settings.zoom + 10) })}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            aria-label="Phóng to"
                        >
                            <ZoomIn className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                    >
                        {isFullscreen ? (
                            <Minimize className="w-5 h-5 text-white" />
                        ) : (
                            <Maximize className="w-5 h-5 text-white" />
                        )}
                    </button>

                    {/* Next Chapter */}
                    <button
                        onClick={onNextChapter}
                        disabled={!hasNextChapter}
                        className={cn(
                            'p-2 rounded-lg transition-colors',
                            hasNextChapter
                                ? 'hover:bg-white/10 text-white'
                                : 'text-gray-600 cursor-not-allowed'
                        )}
                        aria-label="Chương sau"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <SettingsPanel
                    onClose={() => setShowSettings(false)}
                />
            )}
        </>
    );
}

// Settings Panel Component
function SettingsPanel({ onClose }: { onClose: () => void }) {
    const { settings, updateSettings } = useViewerStore();

    const readingModes: { value: ReadingMode; label: string }[] = [
        { value: 'webtoon', label: 'Cuộn dọc' },
        { value: 'paged', label: 'Từng trang' },
        { value: 'rtl', label: 'Phải → Trái' },
    ];

    return (
        <div
            className={cn(
                'fixed right-0 top-0 bottom-0 z-50 w-80',
                'bg-gray-900 border-l border-gray-800',
                'animate-in slide-in-from-right duration-200'
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h2 className="text-white font-medium">Cài đặt</h2>
                <button
                    onClick={onClose}
                    className="p-1 rounded hover:bg-gray-800 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Settings Content */}
            <div className="p-4 space-y-6">
                {/* Reading Mode */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Chế độ đọc
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {readingModes.map((mode) => (
                            <button
                                key={mode.value}
                                onClick={() => updateSettings({ readingMode: mode.value })}
                                className={cn(
                                    'px-3 py-2 rounded-lg text-sm transition-colors',
                                    settings.readingMode === mode.value
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                )}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Brightness */}
                <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Sun className="w-4 h-4" />
                        Độ sáng: {settings.brightness}%
                    </label>
                    <input
                        type="range"
                        min={20}
                        max={100}
                        value={settings.brightness}
                        onChange={(e) => updateSettings({ brightness: parseInt(e.target.value) })}
                        className="w-full accent-purple-500"
                    />
                </div>

                {/* Options */}
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.showPageNumber}
                            onChange={(e) => updateSettings({ showPageNumber: e.target.checked })}
                            className="w-4 h-4 accent-purple-500"
                        />
                        <span className="text-sm text-gray-300">Hiện số trang</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoNextChapter}
                            onChange={(e) => updateSettings({ autoNextChapter: e.target.checked })}
                            className="w-4 h-4 accent-purple-500"
                        />
                        <span className="text-sm text-gray-300">Tự động chuyển chương</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
