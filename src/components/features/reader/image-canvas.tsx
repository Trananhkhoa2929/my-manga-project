"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChapterImage } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCanvasProps {
  images: ChapterImage[];
  onPageChange?: (page: number) => void;
}

export function ImageCanvas({ images, onPageChange }: ImageCanvasProps) {
  return (
    <div className="mx-auto max-w-[900px] bg-black">
      {images.map((image, index) => (
        <LazyImage
          key={image.page}
          image={image}
          index={index}
          onVisible={() => onPageChange?.(image.page)}
        />
      ))}
    </div>
  );
}

interface LazyImageProps {
  image: ChapterImage;
  index: number;
  onVisible?: () => void;
}

function LazyImage({ image, index, onVisible }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(image.src);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          onVisible?.();
        }
      },
      { rootMargin: "200px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [onVisible]);

  const handleError = () => {
    if (currentSrc === image.src && image.backupSrc) {
      // Try backup source
      setCurrentSrc(image.backupSrc);
    } else {
      setHasError(true);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoaded(false);
    setCurrentSrc(image.src);
  };

  return (
    <div ref={imgRef} className="relative w-full">
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <Skeleton className="aspect-[2/3] w-full bg-background-surface2" />
      )}

      {/* Error State */}
      {hasError && (
        <div className="flex aspect-[2/3] w-full flex-col items-center justify-center bg-background-surface1 text-text-secondary">
          <AlertTriangle className="mb-2 h-8 w-8" />
          <p className="mb-3 text-sm">Không thể tải ảnh</p>
          <Button variant="secondary" size="sm" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        </div>
      )}

      {/* Image */}
      {isInView && !hasError && (
        <img
          src={currentSrc}
          alt={`Trang ${image.page}`}
          className={`w-full transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"
            }`}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Page Number (optional) */}
      {isLoaded && (
        <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {image.page}
        </div>
      )}
    </div>
  );
}