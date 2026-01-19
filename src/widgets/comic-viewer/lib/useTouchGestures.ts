/**
 * Touch Gestures Hook
 * 
 * Provides touch gesture support for the comic viewer.
 * - Tap left/right edges: prev/next page
 * - Tap center: toggle controls
 * - Pinch: zoom
 * - Double tap: fit width toggle
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useViewerStore } from '../model/viewerStore';

interface TouchGesturesOptions {
    onNextPage?: () => void;
    onPrevPage?: () => void;
    onToggleControls?: () => void;
    enabled?: boolean;
    edgeThreshold?: number; // % of screen width for edge tap
}

interface TouchState {
    startX: number;
    startY: number;
    startTime: number;
    startDistance: number;
    startZoom: number;
}

export function useTouchGestures({
    onNextPage,
    onPrevPage,
    onToggleControls,
    enabled = true,
    edgeThreshold = 25, // 25% of screen width
}: TouchGesturesOptions) {
    const { updateSettings, settings } = useViewerStore();
    const touchRef = useRef<TouchState | null>(null);
    const lastTapRef = useRef<number>(0);
    const [isZooming, setIsZooming] = useState(false);

    // Get distance between two touch points
    const getDistance = useCallback((touches: TouchList): number => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }, []);

    // Handle touch start
    const handleTouchStart = useCallback(
        (event: TouchEvent) => {
            if (!enabled) return;

            if (event.touches.length === 2) {
                // Pinch zoom start
                setIsZooming(true);
                touchRef.current = {
                    startX: 0,
                    startY: 0,
                    startTime: Date.now(),
                    startDistance: getDistance(event.touches),
                    startZoom: settings.zoom,
                };
            } else if (event.touches.length === 1) {
                touchRef.current = {
                    startX: event.touches[0].clientX,
                    startY: event.touches[0].clientY,
                    startTime: Date.now(),
                    startDistance: 0,
                    startZoom: settings.zoom,
                };
            }
        },
        [enabled, getDistance, settings.zoom]
    );

    // Handle touch move
    const handleTouchMove = useCallback(
        (event: TouchEvent) => {
            if (!enabled || !touchRef.current) return;

            if (event.touches.length === 2 && isZooming) {
                // Pinch zoom
                const currentDistance = getDistance(event.touches);
                const scale = currentDistance / touchRef.current.startDistance;
                const newZoom = Math.min(200, Math.max(50, touchRef.current.startZoom * scale));
                updateSettings({ zoom: Math.round(newZoom) });
            }
        },
        [enabled, isZooming, getDistance, updateSettings]
    );

    // Handle touch end
    const handleTouchEnd = useCallback(
        (event: TouchEvent) => {
            if (!enabled || !touchRef.current) return;

            const touch = touchRef.current;
            touchRef.current = null;
            setIsZooming(false);

            // Ignore if was zooming
            if (touch.startDistance > 0) return;

            const deltaTime = Date.now() - touch.startTime;
            const deltaX = Math.abs((event.changedTouches[0]?.clientX || 0) - touch.startX);
            const deltaY = Math.abs((event.changedTouches[0]?.clientY || 0) - touch.startY);

            // Only handle taps (not swipes)
            if (deltaTime > 300 || deltaX > 30 || deltaY > 30) return;

            const screenWidth = window.innerWidth;
            const tapX = event.changedTouches[0]?.clientX || 0;
            const leftEdge = screenWidth * (edgeThreshold / 100);
            const rightEdge = screenWidth * (1 - edgeThreshold / 100);

            // Double tap detection
            const now = Date.now();
            if (now - lastTapRef.current < 300) {
                // Double tap - toggle fit width
                const newZoom = settings.zoom === 100 ? 150 : 100;
                updateSettings({ zoom: newZoom });
                lastTapRef.current = 0;
                return;
            }
            lastTapRef.current = now;

            // Edge tap navigation
            if (tapX < leftEdge) {
                onPrevPage?.();
            } else if (tapX > rightEdge) {
                onNextPage?.();
            } else {
                // Center tap - toggle controls
                onToggleControls?.();
            }
        },
        [
            enabled,
            edgeThreshold,
            settings.zoom,
            updateSettings,
            onPrevPage,
            onNextPage,
            onToggleControls,
        ]
    );

    // Attach event listeners
    useEffect(() => {
        if (!enabled) return;

        const options = { passive: true };
        document.addEventListener('touchstart', handleTouchStart, options);
        document.addEventListener('touchmove', handleTouchMove, options);
        document.addEventListener('touchend', handleTouchEnd, options);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

    return { isZooming };
}
