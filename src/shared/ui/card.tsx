/**
 * Card Component
 * 
 * Container component with variants
 */

import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@shared/lib';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'bordered' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export function Card({
    variant = 'default',
    padding = 'md',
    className,
    children,
    ...props
}: CardProps) {
    const variants = {
        default: 'bg-gray-900',
        elevated: 'bg-gray-900 shadow-xl shadow-black/20',
        bordered: 'bg-gray-900/50 border border-gray-800',
        glass: 'bg-gray-900/30 backdrop-blur-md border border-gray-700/50',
    };

    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    return (
        <div
            className={cn(
                'rounded-xl',
                variants[variant],
                paddings[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// Sub-components
export function CardHeader({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('pb-4 border-b border-gray-800', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn('text-lg font-semibold text-white', className)}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardContent({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('py-4', className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('pt-4 border-t border-gray-800 flex gap-3', className)}
            {...props}
        >
            {children}
        </div>
    );
}
