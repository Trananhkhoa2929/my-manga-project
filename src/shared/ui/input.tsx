/**
 * Input Component
 * 
 * Text input with label, error state, and icons
 */

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import { cn } from '@shared/lib';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            label,
            error,
            hint,
            leftIcon,
            rightIcon,
            id,
            ...props
        },
        ref
    ) => {
        const uniqueId = useId();
        const inputId = id || uniqueId;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-300 mb-1.5"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            // Base styles
                            'w-full rounded-lg border bg-gray-900/50 px-4 py-2.5',
                            'text-white placeholder-gray-500',
                            'transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                            // Border states
                            error
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-gray-700 hover:border-gray-600 focus:border-purple-500',
                            // Icon padding
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            // Disabled
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            className
                        )}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-1.5 text-sm text-red-400">{error}</p>
                )}

                {hint && !error && (
                    <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
