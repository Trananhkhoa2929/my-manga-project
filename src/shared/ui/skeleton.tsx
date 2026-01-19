/**
 * Skeleton Component
 * 
 * Loading placeholder with shimmer animation
 */

import { cn } from '@shared/lib';

export interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'circular' | 'text';
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
}

export function Skeleton({
    className,
    variant = 'default',
    width,
    height,
    style,
}: SkeletonProps) {
    const variants = {
        default: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4',
    };

    return (
        <div
            className={cn(
                'animate-pulse bg-gray-800',
                variants[variant],
                className
            )}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                ...style,
            }}
            aria-hidden="true"
        />
    );
}

// Skeleton variants for common use cases
export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    className={i === lines - 1 ? 'w-3/4' : 'w-full'}
                />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="p-4 rounded-xl bg-gray-900 space-y-4">
            <Skeleton height={200} className="w-full" />
            <SkeletonText lines={2} />
        </div>
    );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
    return <Skeleton variant="circular" width={size} height={size} />;
}
