/**
 * Spinner Component
 * 
 * Loading spinner indicator
 */

import { cn } from '@shared/lib';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-3',
    };

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-white/30 border-t-white',
                sizes[size],
                className
            )}
            role="status"
            aria-label="Loading"
        />
    );
}
