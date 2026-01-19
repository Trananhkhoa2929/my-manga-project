/**
 * Comic Viewer Widget
 * 
 * High-performance manga reader with virtualization, preloading, and multiple reading modes.
 */

export { VirtualizedImageList, type VirtualizedImageListProps, type ChapterImage } from './ui/VirtualizedImageList';
export { ImagePreloader } from './lib/ImagePreloader';
export { useViewerStore, type ViewerSettings, type ReadingMode } from './model/viewerStore';
export { ViewerControls } from './ui/ViewerControls';
export { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from './lib/useKeyboardShortcuts';
export { useTouchGestures } from './lib/useTouchGestures';
