/**
 * Toast Notification System
 * 
 * Provides a context-based toast notification system with
 * multiple variants and auto-dismiss functionality.
 */

'use client';

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@shared/lib';

// Types
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

// Context
const ToastContext = createContext<ToastContextValue | null>(null);

// Provider Component
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(
        (toast: Omit<Toast, 'id'>) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const newToast: Toast = { ...toast, id };

            setToasts((prev) => [...prev, newToast]);

            // Auto-dismiss
            const duration = toast.duration ?? 5000;
            if (duration > 0) {
                setTimeout(() => removeToast(id), duration);
            }
        },
        [removeToast]
    );

    // Convenience methods
    const success = useCallback(
        (message: string, duration?: number) => {
            addToast({ message, variant: 'success', duration });
        },
        [addToast]
    );

    const error = useCallback(
        (message: string, duration?: number) => {
            addToast({ message, variant: 'error', duration: duration ?? 8000 });
        },
        [addToast]
    );

    const warning = useCallback(
        (message: string, duration?: number) => {
            addToast({ message, variant: 'warning', duration });
        },
        [addToast]
    );

    const info = useCallback(
        (message: string, duration?: number) => {
            addToast({ message, variant: 'info', duration });
        },
        [addToast]
    );

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, removeToast, success, error, warning, info }}
        >
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// Hook
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast Container (renders at bottom-right)
function ToastContainer({
    toasts,
    onRemove,
}: {
    toasts: Toast[];
    onRemove: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full"
            aria-live="polite"
            aria-atomic="true"
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// Individual Toast Item
function ToastItem({
    toast,
    onRemove,
}: {
    toast: Toast;
    onRemove: (id: string) => void;
}) {
    const variants = {
        success: {
            bg: 'bg-green-900/90 border-green-700',
            icon: CheckCircle,
            iconColor: 'text-green-400',
        },
        error: {
            bg: 'bg-red-900/90 border-red-700',
            icon: AlertCircle,
            iconColor: 'text-red-400',
        },
        warning: {
            bg: 'bg-yellow-900/90 border-yellow-700',
            icon: AlertTriangle,
            iconColor: 'text-yellow-400',
        },
        info: {
            bg: 'bg-blue-900/90 border-blue-700',
            icon: Info,
            iconColor: 'text-blue-400',
        },
    };

    const config = variants[toast.variant];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm',
                'shadow-lg shadow-black/20',
                'animate-in slide-in-from-right fade-in duration-200',
                config.bg
            )}
            role="alert"
        >
            <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
            <p className="text-sm text-white flex-1">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                aria-label="Dismiss notification"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
