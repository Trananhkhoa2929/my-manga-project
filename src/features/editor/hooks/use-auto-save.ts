'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface AutoSaveOptions<T> {
    /** Save interval in milliseconds (default: 30000 = 30s) */
    interval?: number;
    /** Debounce delay for change-triggered saves (default: 2000 = 2s) */
    debounceDelay?: number;
    /** Storage key for localStorage */
    storageKey: string;
    /** Callback to save data (e.g., to server) */
    onSave?: (data: T) => Promise<void>;
    /** Whether auto-save is enabled */
    enabled?: boolean;
}

interface AutoSaveState {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved: Date | null;
    error: string | null;
}

interface UseAutoSaveReturn<T> {
    /** Current save state */
    saveState: AutoSaveState;
    /** Manually trigger save */
    save: () => Promise<void>;
    /** Check for recovered data on mount */
    recover: () => T | null;
    /** Clear saved data */
    clearSaved: () => void;
    /** Mark data as changed (triggers debounced save) */
    markChanged: () => void;
}

/**
 * useAutoSave hook
 * Provides auto-save functionality with interval and change detection
 * 
 * @param data - Current data to save
 * @param options - Configuration options
 * @returns Auto-save controls and state
 */
export function useAutoSave<T>(
    data: T,
    options: AutoSaveOptions<T>
): UseAutoSaveReturn<T> {
    const {
        interval = 30000,
        debounceDelay = 2000,
        storageKey,
        onSave,
        enabled = true,
    } = options;

    const [saveState, setSaveState] = useState<AutoSaveState>({
        status: 'idle',
        lastSaved: null,
        error: null,
    });

    const dataRef = useRef(data);
    const lastSavedDataRef = useRef<string>('');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // Update data ref on changes
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    /**
     * Core save function
     */
    const performSave = useCallback(async () => {
        if (!enabled || !isMountedRef.current) return;

        const currentData = JSON.stringify(dataRef.current);

        // Skip if nothing changed
        if (currentData === lastSavedDataRef.current) {
            return;
        }

        setSaveState(prev => ({ ...prev, status: 'saving', error: null }));

        try {
            // Save to localStorage
            localStorage.setItem(storageKey, currentData);
            localStorage.setItem(`${storageKey}_timestamp`, new Date().toISOString());

            // Save to server if callback provided
            if (onSave) {
                await onSave(dataRef.current);
            }

            lastSavedDataRef.current = currentData;

            if (isMountedRef.current) {
                setSaveState({
                    status: 'saved',
                    lastSaved: new Date(),
                    error: null,
                });

                // Reset to idle after 3 seconds
                setTimeout(() => {
                    if (isMountedRef.current) {
                        setSaveState(prev => ({ ...prev, status: 'idle' }));
                    }
                }, 3000);
            }
        } catch (error) {
            if (isMountedRef.current) {
                setSaveState({
                    status: 'error',
                    lastSaved: null,
                    error: error instanceof Error ? error.message : 'Save failed',
                });
            }
        }
    }, [enabled, storageKey, onSave]);

    /**
     * Public save trigger
     */
    const save = useCallback(async () => {
        await performSave();
    }, [performSave]);

    /**
     * Mark data as changed (triggers debounced save)
     */
    const markChanged = useCallback(() => {
        if (!enabled) return;

        // Clear existing debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new debounce timer
        debounceTimerRef.current = setTimeout(() => {
            performSave();
        }, debounceDelay);
    }, [enabled, debounceDelay, performSave]);

    /**
     * Recover data from localStorage
     */
    const recover = useCallback((): T | null => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                return JSON.parse(saved) as T;
            }
        } catch (error) {
            console.error('Failed to recover data:', error);
        }
        return null;
    }, [storageKey]);

    /**
     * Clear saved data
     */
    const clearSaved = useCallback(() => {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_timestamp`);
        lastSavedDataRef.current = '';
    }, [storageKey]);

    // Set up interval auto-save
    useEffect(() => {
        if (!enabled) return;

        intervalRef.current = setInterval(() => {
            performSave();
        }, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, interval, performSave]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Save on beforeunload
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Synchronous save to localStorage on page exit
            try {
                localStorage.setItem(storageKey, JSON.stringify(dataRef.current));
                localStorage.setItem(`${storageKey}_timestamp`, new Date().toISOString());
            } catch (error) {
                console.error('Failed to save on exit:', error);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [storageKey]);

    return {
        saveState,
        save,
        recover,
        clearSaved,
        markChanged,
    };
}

/**
 * Save status indicator component helper
 */
export function getSaveStatusText(status: AutoSaveState['status']): string {
    switch (status) {
        case 'saving': return 'Đang lưu...';
        case 'saved': return 'Đã lưu';
        case 'error': return 'Lỗi lưu';
        default: return '';
    }
}

export function getSaveStatusColor(status: AutoSaveState['status']): string {
    switch (status) {
        case 'saving': return 'text-yellow-400';
        case 'saved': return 'text-green-400';
        case 'error': return 'text-red-400';
        default: return 'text-gray-400';
    }
}
