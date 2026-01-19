/**
 * VirtualizedImageList Component
 * 
 * High-performance image list using @tanstack/react-virtual.
 * Renders only visible images + buffer for smooth 60fps scrolling.
 */

'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@shared/lib';
import { Skeleton } from '@shared/ui';

export interface ChapterImage {
    id: string;
    page: number;
    src: string;
    backupSrc?: string;
    width: number;
    height: number;
}

export interface VirtualizedImageListProps {
    images: ChapterImage[];
    containerWidth?: number;
    onPageChange?: (page: number) => void;
    onProgressChange?: (progress: number) => void;
    className?: string;
}

interface ImageDimensions {
    [key: string]: { width: number; height: number; loaded: boolean };
}

export function VirtualizedImageList({
    images,
    containerWidth = 900,
    onPageChange,
    onProgressChange,
    className,
}: VirtualizedImageListProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<ImageDimensions>({});

    // Calculate estimated height based on aspect ratio
    const estimateSize = useCallback(
        (index: number) => {
            const image = images[index];
            const cached = dimensions[image.id];

            if (cached?.loaded) {
                return (cached.height / cached.width) * containerWidth;
            }

            // Use provided dimensions or estimate
            if (image.width && image.height) {
                return (image.height / image.width) * containerWidth;
            }

            // Default manga page aspect ratio ~2:3
            return containerWidth * 1.5;
        },
        [images, dimensions, containerWidth]
    );

    const virtualizer = useVirtualizer({
        count: images.length,
        getScrollElement: () => parentRef.current,
        estimateSize,
        overscan: 3, // Buffer 3 items above and below viewport
        measureElement: (element) => {
            // Measure actual height after image loads
            return element.getBoundingClientRect().height;
        },
    });

    // Track current page based on scroll position
    const handleScroll = useCallback(() => {
        const items = virtualizer.getVirtualItems();
        if (items.length === 0) return;

        const scrollElement = parentRef.current;
        if (!scrollElement) return;

        const scrollTop = scrollElement.scrollTop;
        const viewportHeight = scrollElement.clientHeight;
        const viewportCenter = scrollTop + viewportHeight / 2;

        // Find the item at viewport center
        for (const item of items) {
            if (item.start <= viewportCenter && item.end >= viewportCenter) {
                onPageChange?.(images[item.index].page);
                break;
            }
        }

        // Calculate progress
        const totalHeight = virtualizer.getTotalSize();
        const progress = Math.min(
            ((scrollTop + viewportHeight) / totalHeight) * 100,
            100
        );
        onProgressChange?.(progress);
    }, [virtualizer, images, onPageChange, onProgressChange]);

    // Attach scroll listener
    useEffect(() => {
        const scrollElement = parentRef.current;
        if (!scrollElement) return;

        scrollElement.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Update dimensions when image loads
    const handleImageLoad = useCallback(
        (imageId: string, width: number, height: number) => {
            setDimensions((prev) => ({
                ...prev,
                [imageId]: { width, height, loaded: true },
            }));
            // Re-measure items
            virtualizer.measure();
        },
        [virtualizer]
    );

    return (
        <div
            ref={parentRef}
            className={cn(
                'h-screen overflow-y-auto overflow-x-hidden bg-black',
                className
            )}
        >
            <div
                className="relative mx-auto"
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    maxWidth: `${containerWidth}px`,
                }}
            >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                    const image = images[virtualItem.index];
                    return (
                        <div
                            key={virtualItem.key}
                            data-index={virtualItem.index}
                            ref={virtualizer.measureElement}
                            className="absolute left-0 top-0 w-full"
                            style={{
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                        >
                            <VirtualImage
                                image={image}
                                onLoad={handleImageLoad}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Individual virtualized image component
interface VirtualImageProps {
    image: ChapterImage;
    onLoad: (id: string, width: number, height: number) => void;
}

function VirtualImage({ image, onLoad }: VirtualImageProps) {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [currentSrc, setCurrentSrc] = useState(image.src);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleLoad = useCallback(() => {
        if (imgRef.current) {
            onLoad(image.id, imgRef.current.naturalWidth, imgRef.current.naturalHeight);
        }
        setStatus('loaded');
    }, [image.id, onLoad]);

    const handleError = useCallback(() => {
        if (currentSrc === image.src && image.backupSrc) {
            setCurrentSrc(image.backupSrc);
        } else {
            setStatus('error');
        }
    }, [currentSrc, image.src, image.backupSrc]);

    const handleRetry = useCallback(() => {
        setStatus('loading');
        setCurrentSrc(image.src);
    }, [image.src]);

    // Calculate aspect ratio for skeleton
    const aspectRatio = image.width && image.height
        ? image.height / image.width
        : 1.5;

    return (
        <div className="relative w-full">
            {/* Loading State */}
            {status === 'loading' && (
                <Skeleton
                    className="w-full bg-gray-800"
                    style={{ aspectRatio: `1/${aspectRatio}` }}
                />
            )}

            {/* Error State */}
            {status === 'error' && (
                <div
                    className="flex flex-col items-center justify-center bg-gray-900 text-gray-400"
                    style={{ aspectRatio: `1/${aspectRatio}` }}
                >
                    <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <p className="text-sm mb-3">Không thể tải trang {image.page}</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Image */}
            <img
                ref={imgRef}
                src={currentSrc}
                alt={`Trang ${image.page}`}
                className={cn(
                    'w-full transition-opacity duration-300',
                    status === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0'
                )}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
                decoding="async"
            />

            {/* Page Number Indicator */}
            {status === 'loaded' && (
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white font-medium">
                    {image.page}
                </div>
            )}
        </div>
    );
}
