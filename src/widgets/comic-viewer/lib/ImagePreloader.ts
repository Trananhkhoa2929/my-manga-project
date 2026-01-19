/**
 * Image Preloader Service
 * 
 * Manages preloading of upcoming images for seamless reading experience.
 * Uses priority queue to load nearest images first.
 */

import type { ChapterImage } from '../ui/VirtualizedImageList';

interface PreloadItem {
    image: ChapterImage;
    priority: number;
}

class ImagePreloaderClass {
    private cache = new Map<string, HTMLImageElement>();
    private queue: PreloadItem[] = [];
    private loading = new Set<string>();
    private maxConcurrent = 3;
    private maxCacheSize = 50;

    /**
     * Preload images around the current page
     * @param images All chapter images
     * @param currentIndex Current visible page index
     * @param ahead Number of pages to preload ahead
     * @param behind Number of pages to keep cached behind
     */
    preloadAround(
        images: ChapterImage[],
        currentIndex: number,
        ahead = 5,
        behind = 2
    ): void {
        // Clear queue and re-prioritize
        this.queue = [];

        // Add images ahead with priority (lower = higher priority)
        for (let i = 1; i <= ahead; i++) {
            const index = currentIndex + i;
            if (index < images.length && !this.cache.has(images[index].src)) {
                this.queue.push({
                    image: images[index],
                    priority: i,
                });
            }
        }

        // Add images behind with lower priority
        for (let i = 1; i <= behind; i++) {
            const index = currentIndex - i;
            if (index >= 0 && !this.cache.has(images[index].src)) {
                this.queue.push({
                    image: images[index],
                    priority: ahead + i,
                });
            }
        }

        // Sort by priority and start loading
        this.queue.sort((a, b) => a.priority - b.priority);
        this.processQueue();

        // Cleanup old cache entries
        this.cleanupCache(images, currentIndex, ahead, behind);
    }

    /**
     * Process the preload queue
     */
    private processQueue(): void {
        while (
            this.loading.size < this.maxConcurrent &&
            this.queue.length > 0
        ) {
            const item = this.queue.shift();
            if (!item) break;

            const { image } = item;
            if (this.cache.has(image.src) || this.loading.has(image.src)) {
                continue;
            }

            this.loading.add(image.src);

            const img = new Image();
            img.onload = () => {
                this.cache.set(image.src, img);
                this.loading.delete(image.src);
                this.processQueue();
            };
            img.onerror = () => {
                this.loading.delete(image.src);
                // Try backup source
                if (image.backupSrc) {
                    const backupImg = new Image();
                    backupImg.onload = () => {
                        this.cache.set(image.src, backupImg);
                        this.processQueue();
                    };
                    backupImg.onerror = () => this.processQueue();
                    backupImg.src = image.backupSrc;
                } else {
                    this.processQueue();
                }
            };
            img.src = image.src;
        }
    }

    /**
     * Remove old images from cache
     */
    private cleanupCache(
        images: ChapterImage[],
        currentIndex: number,
        ahead: number,
        behind: number
    ): void {
        if (this.cache.size <= this.maxCacheSize) return;

        const keepRange = new Set<string>();
        for (let i = currentIndex - behind; i <= currentIndex + ahead; i++) {
            if (i >= 0 && i < images.length) {
                keepRange.add(images[i].src);
            }
        }

        // Remove images outside keep range
        for (const [src] of this.cache) {
            if (!keepRange.has(src)) {
                this.cache.delete(src);
            }
        }
    }

    /**
     * Cancel all pending preloads
     */
    cancelAll(): void {
        this.queue = [];
    }

    /**
     * Check if image is cached
     */
    isCached(src: string): boolean {
        return this.cache.has(src);
    }

    /**
     * Get cached image (if available)
     */
    getCached(src: string): HTMLImageElement | undefined {
        return this.cache.get(src);
    }

    /**
     * Clear entire cache
     */
    clearCache(): void {
        this.cache.clear();
        this.queue = [];
        this.loading.clear();
    }
}

// Singleton instance
export const ImagePreloader = new ImagePreloaderClass();
