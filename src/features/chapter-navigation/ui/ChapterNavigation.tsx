/**
 * Chapter Navigation Feature
 * 
 * Provides navigation between chapters with preloading support.
 */

'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, List, Loader2 } from 'lucide-react';
import { cn } from '@shared/lib';
import { Button, Modal } from '@shared/ui';

export interface ChapterInfo {
    id: string;
    number: number;
    title: string;
    slug: string;
}

export interface ChapterNavigationProps {
    currentChapter: ChapterInfo;
    chapters: ChapterInfo[];
    onNavigate: (chapter: ChapterInfo) => void;
    onPreload?: (chapter: ChapterInfo) => void;
    className?: string;
}

export function ChapterNavigation({
    currentChapter,
    chapters,
    onNavigate,
    onPreload,
    className,
}: ChapterNavigationProps) {
    const [showChapterList, setShowChapterList] = useState(false);

    // Find prev/next chapters
    const currentIndex = chapters.findIndex((c) => c.id === currentChapter.id);
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

    // Preload next chapter on mount
    useEffect(() => {
        if (nextChapter && onPreload) {
            onPreload(nextChapter);
        }
    }, [nextChapter, onPreload]);

    const handlePrev = useCallback(() => {
        if (prevChapter) {
            onNavigate(prevChapter);
        }
    }, [prevChapter, onNavigate]);

    const handleNext = useCallback(() => {
        if (nextChapter) {
            onNavigate(nextChapter);
        }
    }, [nextChapter, onNavigate]);

    return (
        <>
            <div className={cn('flex items-center gap-2', className)}>
                {/* Prev Chapter */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={!prevChapter}
                    className="gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Trước</span>
                </Button>

                {/* Chapter List Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChapterList(true)}
                    className="gap-2 min-w-[120px]"
                >
                    <List className="w-4 h-4" />
                    <span>Ch. {currentChapter.number}</span>
                </Button>

                {/* Next Chapter */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    disabled={!nextChapter}
                    className="gap-1"
                >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Chapter List Modal */}
            <ChapterListModal
                isOpen={showChapterList}
                onClose={() => setShowChapterList(false)}
                chapters={chapters}
                currentChapterId={currentChapter.id}
                onSelect={(chapter) => {
                    onNavigate(chapter);
                    setShowChapterList(false);
                }}
            />
        </>
    );
}

// Chapter List Modal
interface ChapterListModalProps {
    isOpen: boolean;
    onClose: () => void;
    chapters: ChapterInfo[];
    currentChapterId: string;
    onSelect: (chapter: ChapterInfo) => void;
}

function ChapterListModal({
    isOpen,
    onClose,
    chapters,
    currentChapterId,
    onSelect,
}: ChapterListModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Danh sách chương"
            size="md"
        >
            <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6">
                <div className="space-y-1">
                    {chapters.map((chapter) => (
                        <button
                            key={chapter.id}
                            onClick={() => onSelect(chapter)}
                            className={cn(
                                'w-full px-4 py-3 rounded-lg text-left transition-colors',
                                'hover:bg-gray-800',
                                chapter.id === currentChapterId
                                    ? 'bg-purple-600/20 text-purple-400 border border-purple-600/40'
                                    : 'text-gray-300'
                            )}
                        >
                            <span className="font-medium">Chương {chapter.number}</span>
                            {chapter.title && (
                                <span className="text-gray-500 ml-2">- {chapter.title}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    );
}

// Auto Chapter Navigation Hook
export function useAutoChapterNavigation(
    onNextChapter: () => void,
    progress: number,
    enabled: boolean = true
) {
    const [showPrompt, setShowPrompt] = useState(false);

    const hasShownPrompt = useRef(false);

    // Reset prompt state when progress resets (new chapter)
    useEffect(() => {
        if (progress < 10) {
            hasShownPrompt.current = false;
            setShowPrompt(false);
        }
    }, [progress]);

    useEffect(() => {
        if (enabled && progress >= 95 && !hasShownPrompt.current) {
            setShowPrompt(true);
            hasShownPrompt.current = true;
        }
    }, [progress, enabled]);

    const handleConfirm = useCallback(() => {
        setShowPrompt(false);
        onNextChapter();
    }, [onNextChapter]);

    const handleDismiss = useCallback(() => {
        setShowPrompt(false);
    }, []);

    return {
        showPrompt,
        handleConfirm,
        handleDismiss,
    };
}

// End of Chapter Prompt
interface EndOfChapterPromptProps {
    isVisible: boolean;
    nextChapter: ChapterInfo | null;
    onNext: () => void;
    onDismiss: () => void;
    isLoading?: boolean;
}

export function EndOfChapterPrompt({
    isVisible,
    nextChapter,
    onNext,
    onDismiss,
    isLoading = false,
}: EndOfChapterPromptProps) {
    if (!isVisible || !nextChapter) return null;

    return (
        <div
            className={cn(
                'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
                'bg-gray-900 border border-gray-700 rounded-xl shadow-2xl',
                'p-4 flex items-center gap-4',
                'animate-in slide-in-from-bottom fade-in duration-300'
            )}
        >
            <div className="text-sm">
                <p className="text-gray-400">Chương tiếp theo</p>
                <p className="text-white font-medium">
                    Ch. {nextChapter.number}: {nextChapter.title || 'Không có tiêu đề'}
                </p>
            </div>

            <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onNext}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        'Đọc tiếp'
                    )}
                </Button>
            </div>
        </div>
    );
}
