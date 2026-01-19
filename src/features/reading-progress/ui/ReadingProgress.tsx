/**
 * Reading Progress Feature
 * 
 * Tracks and displays reading progress with history management.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Clock, Trash2, ChevronRight } from 'lucide-react';
import { cn, formatRelativeTime } from '@shared/lib';
import { Button, Modal, Card } from '@shared/ui';

export interface ReadingHistoryItem {
    comicId: string;
    comicTitle: string;
    comicSlug: string;
    coverImage: string;
    chapterId: string;
    chapterNumber: number;
    chapterTitle?: string;
    currentPage: number;
    totalPages: number;
    progress: number;
    lastReadAt: string;
}

interface ReadingProgressProps {
    history: ReadingHistoryItem[];
    onContinueReading: (item: ReadingHistoryItem) => void;
    onRemove: (comicId: string) => void;
    onClearAll: () => void;
    className?: string;
}

export function ReadingProgress({
    history,
    onContinueReading,
    onRemove,
    onClearAll,
    className,
}: ReadingProgressProps) {
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    if (history.length === 0) {
        return (
            <div className={cn('text-center py-12', className)}>
                <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                    Chưa có lịch sử đọc
                </h3>
                <p className="text-gray-500 text-sm">
                    Bắt đầu đọc truyện để theo dõi tiến độ
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Đọc gần đây
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearConfirm(true)}
                >
                    Xóa tất cả
                </Button>
            </div>

            {/* History List */}
            <div className="grid gap-3">
                {history.map((item) => (
                    <ReadingHistoryCard
                        key={item.comicId}
                        item={item}
                        onContinue={() => onContinueReading(item)}
                        onRemove={() => onRemove(item.comicId)}
                    />
                ))}
            </div>

            {/* Clear Confirmation Modal */}
            <Modal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                title="Xóa lịch sử đọc?"
                size="sm"
            >
                <p className="text-gray-400 mb-4">
                    Bạn có chắc muốn xóa toàn bộ lịch sử đọc? Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowClearConfirm(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            onClearAll();
                            setShowClearConfirm(false);
                        }}
                    >
                        Xóa tất cả
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

// Reading History Card
interface ReadingHistoryCardProps {
    item: ReadingHistoryItem;
    onContinue: () => void;
    onRemove: () => void;
}

function ReadingHistoryCard({
    item,
    onContinue,
    onRemove,
}: ReadingHistoryCardProps) {
    return (
        <Card variant="bordered" padding="none" className="overflow-hidden">
            <div className="flex">
                {/* Cover Image */}
                <div className="w-20 h-28 flex-shrink-0">
                    <img
                        src={item.coverImage}
                        alt={item.comicTitle}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                        <h3 className="font-medium text-white truncate">
                            {item.comicTitle}
                        </h3>
                        <p className="text-sm text-gray-400">
                            Chương {item.chapterNumber}
                            {item.chapterTitle && `: ${item.chapterTitle}`}
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        {/* Progress Bar */}
                        <div className="flex-1 mr-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>{item.progress}%</span>
                                <span>{formatRelativeTime(item.lastReadAt)}</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 transition-all"
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                            <button
                                onClick={onRemove}
                                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                title="Xóa"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onContinue}
                                className="p-1.5 text-purple-400 hover:text-purple-300 transition-colors"
                                title="Đọc tiếp"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

// Continue Reading Button (for comic detail page)
interface ContinueReadingButtonProps {
    item: ReadingHistoryItem | null;
    onContinue: () => void;
    className?: string;
}

export function ContinueReadingButton({
    item,
    onContinue,
    className,
}: ContinueReadingButtonProps) {
    if (!item) return null;

    return (
        <Button
            variant="primary"
            onClick={onContinue}
            className={cn('gap-2', className)}
        >
            <BookOpen className="w-5 h-5" />
            Đọc tiếp Ch.{item.chapterNumber} ({item.progress}%)
        </Button>
    );
}

// Hook for managing reading progress
export function useReadingProgress() {
    const [history, setHistory] = useState<ReadingHistoryItem[]>([]);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('mangahub-reading-history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch {
                // Invalid data
            }
        }
    }, []);

    // Save to localStorage
    const saveHistory = useCallback((items: ReadingHistoryItem[]) => {
        setHistory(items);
        localStorage.setItem('mangahub-reading-history', JSON.stringify(items));
    }, []);

    // Update progress
    const updateProgress = useCallback(
        (item: Omit<ReadingHistoryItem, 'lastReadAt'>) => {
            const newItem: ReadingHistoryItem = {
                ...item,
                lastReadAt: new Date().toISOString(),
            };

            setHistory((prev) => {
                const filtered = prev.filter((h) => h.comicId !== item.comicId);
                const updated = [newItem, ...filtered].slice(0, 50); // Keep max 50 items
                localStorage.setItem('mangahub-reading-history', JSON.stringify(updated));
                return updated;
            });
        },
        []
    );

    // Remove item
    const removeItem = useCallback((comicId: string) => {
        setHistory((prev) => {
            const updated = prev.filter((h) => h.comicId !== comicId);
            localStorage.setItem('mangahub-reading-history', JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Clear all
    const clearAll = useCallback(() => {
        setHistory([]);
        localStorage.removeItem('mangahub-reading-history');
    }, []);

    // Get progress for specific comic
    const getProgress = useCallback(
        (comicId: string): ReadingHistoryItem | null => {
            return history.find((h) => h.comicId === comicId) || null;
        },
        [history]
    );

    return {
        history,
        updateProgress,
        removeItem,
        clearAll,
        getProgress,
    };
}
