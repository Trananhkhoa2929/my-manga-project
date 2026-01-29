'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * History state for undo/redo functionality
 * Uses Command pattern with state snapshots
 */
interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

interface UseHistoryOptions {
    maxHistory?: number;
}

interface UseHistoryReturn<T> {
    state: T;
    setState: (newState: T | ((prev: T) => T)) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clear: () => void;
    historyLength: number;
    futureLength: number;
}

/**
 * useHistory hook
 * Provides undo/redo functionality with configurable history depth
 * 
 * @param initialState - Initial state value
 * @param options - Configuration options
 * @returns History controls and current state
 */
export function useHistory<T>(
    initialState: T,
    options: UseHistoryOptions = {}
): UseHistoryReturn<T> {
    const { maxHistory = 50 } = options;

    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: [],
    });

    // Track if we're in the middle of an undo/redo operation
    const isUndoRedoRef = useRef(false);

    /**
     * Set new state and push current to history
     */
    const setState = useCallback((newState: T | ((prev: T) => T)) => {
        setHistory((prev) => {
            const nextState = typeof newState === 'function'
                ? (newState as (prev: T) => T)(prev.present)
                : newState;

            // Don't add to history if state hasn't changed
            if (JSON.stringify(nextState) === JSON.stringify(prev.present)) {
                return prev;
            }

            // Limit history size
            const newPast = [...prev.past, prev.present].slice(-maxHistory);

            return {
                past: newPast,
                present: nextState,
                future: [], // Clear future on new action
            };
        });
    }, [maxHistory]);

    /**
     * Undo - Go back to previous state
     */
    const undo = useCallback(() => {
        setHistory((prev) => {
            if (prev.past.length === 0) return prev;

            const previous = prev.past[prev.past.length - 1];
            const newPast = prev.past.slice(0, -1);

            isUndoRedoRef.current = true;

            return {
                past: newPast,
                present: previous,
                future: [prev.present, ...prev.future],
            };
        });
    }, []);

    /**
     * Redo - Go forward to next state
     */
    const redo = useCallback(() => {
        setHistory((prev) => {
            if (prev.future.length === 0) return prev;

            const next = prev.future[0];
            const newFuture = prev.future.slice(1);

            isUndoRedoRef.current = true;

            return {
                past: [...prev.past, prev.present],
                present: next,
                future: newFuture,
            };
        });
    }, []);

    /**
     * Clear all history
     */
    const clear = useCallback(() => {
        setHistory((prev) => ({
            past: [],
            present: prev.present,
            future: [],
        }));
    }, []);

    return {
        state: history.present,
        setState,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        clear,
        historyLength: history.past.length,
        futureLength: history.future.length,
    };
}

/**
 * Batch multiple state changes into a single history entry
 */
export function useBatchHistory<T>(
    historyHook: UseHistoryReturn<T>
): {
    batchUpdate: (updates: ((state: T) => T)[]) => void;
} {
    const batchUpdate = useCallback((updates: ((state: T) => T)[]) => {
        if (updates.length === 0) return;

        // Apply all updates and only push final result to history
        historyHook.setState((currentState) => {
            return updates.reduce((state, update) => update(state), currentState);
        });
    }, [historyHook]);

    return { batchUpdate };
}
