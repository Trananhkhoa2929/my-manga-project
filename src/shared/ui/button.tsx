/**
 * Button Component
 * 
 * Primary UI button with multiple variants and sizes
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@shared/lib';
import { Spinner } from './spinner';

import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            disabled,
            leftIcon,
            rightIcon,
            children,
            asChild = false,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : 'button';

        const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

        const variants = {
            primary: `
        bg-gradient-to-r from-purple-600 to-indigo-600
        hover:from-purple-700 hover:to-indigo-700
        text-white shadow-lg shadow-purple-500/25
        focus:ring-purple-500
      `,
            secondary: `
        bg-gray-800 hover:bg-gray-700
        text-white
        focus:ring-gray-500
      `,
            ghost: `
        bg-transparent hover:bg-gray-800/50
        text-gray-300 hover:text-white
        focus:ring-gray-500
      `,
            danger: `
        bg-red-600 hover:bg-red-700
        text-white
        focus:ring-red-500
      `,
            outline: `
        border-2 border-gray-600 hover:border-gray-500
        bg-transparent hover:bg-gray-800/30
        text-gray-300 hover:text-white
        focus:ring-gray-500
      `,
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        };

        return (
            <Comp
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Spinner size={size === 'lg' ? 'md' : 'sm'} />
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </Comp>
        );
    }
);

Button.displayName = 'Button';
