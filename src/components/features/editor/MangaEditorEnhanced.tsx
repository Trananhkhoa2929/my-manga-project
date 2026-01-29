'use client';

/**
 * MangaEditorEnhanced
 * Wraps MangaEditor with undo/redo, auto-save, and export functionality
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useHistory } from '@features/editor/hooks/use-history';
import { useAutoSave, getSaveStatusText, getSaveStatusColor } from '@features/editor/hooks/use-auto-save';
import { useExport } from '@features/editor/hooks/use-export';
import { ExportModal } from '@features/editor/ui/export-modal';
import Konva from 'konva';
import { Undo2, Redo2, Save, Download, Clock } from 'lucide-react';

// Dynamic import to avoid SSR issues with Konva
const MangaEditor = dynamic(
    () => import('./MangaEditor').then(mod => mod.MangaEditor),
    { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
    return (
        <div className="w-full h-[600px] bg-gray-900 rounded-xl animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Loading editor...</div>
        </div>
    );
}

// Types from MangaEditor
interface TextElement {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    fontStyle: string;
    fill: string;
    stroke: string;
    strokeWidth: number;
    isVertical: boolean;
    rotation: number;
    shadowColor: string;
    shadowBlur: number;
    shadowOffset: { x: number; y: number };
}

interface BrushStroke {
    id: string;
    points: number[];
    stroke: string;
    strokeWidth: number;
    tension: number;
    lineCap: 'butt' | 'round' | 'square';
    lineJoin: 'round' | 'bevel' | 'miter';
    globalCompositeOperation: string;
}

interface ShapeElement {
    id: string;
    type: 'rectangle' | 'ellipse';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    rotation: number;
}

interface CanvasData {
    version: string;
    layers: {
        background: { visible: boolean };
        drawing: { visible: boolean; strokes: BrushStroke[] };
        shapes: { visible: boolean; items: ShapeElement[] };
        text: { visible: boolean; items: TextElement[] };
    };
    textElements: TextElement[];
    brushStrokes: BrushStroke[];
    shapes: ShapeElement[];
}

interface MangaEditorEnhancedProps {
    imageUrl: string;
    pageId: string;  // Unique ID for auto-save storage
    initialCanvasData?: CanvasData;
    onSave?: (canvasData: CanvasData) => Promise<void>;
    width?: number;
    height?: number;
}

const defaultCanvasData: CanvasData = {
    version: '1.0',
    layers: {
        background: { visible: true },
        drawing: { visible: true, strokes: [] },
        shapes: { visible: true, items: [] },
        text: { visible: true, items: [] },
    },
    textElements: [],
    brushStrokes: [],
    shapes: [],
};

export function MangaEditorEnhanced({
    imageUrl,
    pageId,
    initialCanvasData,
    onSave,
    width,
    height,
}: MangaEditorEnhancedProps) {
    const stageRef = useRef<Konva.Stage | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // History hook for undo/redo
    const {
        state: canvasData,
        setState: setCanvasData,
        undo,
        redo,
        canUndo,
        canRedo,
        historyLength,
    } = useHistory<CanvasData>(initialCanvasData || defaultCanvasData, {
        maxHistory: 50,
    });

    // Auto-save hook
    const {
        saveState,
        save: triggerSave,
        recover,
        markChanged,
    } = useAutoSave<CanvasData>(canvasData, {
        storageKey: `manga-editor-${pageId}`,
        interval: 30000, // 30 seconds
        debounceDelay: 2000,
        onSave: onSave,
        enabled: true,
    });

    // Export hook
    const { exportSingle } = useExport();

    // Check for recovered data on mount
    useEffect(() => {
        setIsMounted(true);
        const recovered = recover();
        if (recovered && !initialCanvasData) {
            const shouldRecover = window.confirm(
                'Phát hiện dữ liệu chưa lưu từ phiên trước. Bạn có muốn khôi phục không?'
            );
            if (shouldRecover) {
                setCanvasData(recovered);
            }
        }
    }, []);

    // Handle save from editor
    const handleEditorSave = useCallback((data: CanvasData) => {
        setCanvasData(data);
        markChanged();
    }, [setCanvasData, markChanged]);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                triggerSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, triggerSave]);

    if (!isMounted) {
        return <EditorSkeleton />;
    }

    return (
        <div className="relative">
            {/* Enhanced Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-gray-800/95 rounded-xl backdrop-blur-sm border border-gray-700 shadow-xl">
                {/* Undo */}
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${canUndo
                            ? 'hover:bg-gray-700 text-white'
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Undo</span>
                    {historyLength > 0 && (
                        <span className="text-xs bg-gray-700 px-1.5 rounded">{historyLength}</span>
                    )}
                </button>

                {/* Redo */}
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${canRedo
                            ? 'hover:bg-gray-700 text-white'
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo2 className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Redo</span>
                </button>

                <div className="w-px h-6 bg-gray-600" />

                {/* Save Status */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${getSaveStatusColor(saveState.status)}`}>
                    {saveState.status === 'saving' ? (
                        <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{getSaveStatusText(saveState.status) || 'Auto-save'}</span>
                </div>

                <div className="w-px h-6 bg-gray-600" />

                {/* Export */}
                <button
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-700 text-white transition-colors"
                    title="Export"
                >
                    <Download className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Export</span>
                </button>
            </div>

            {/* Editor */}
            <MangaEditor
                imageUrl={imageUrl}
                initialCanvasData={canvasData}
                onSave={handleEditorSave}
                width={width}
                height={height}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                stage={stageRef.current}
                defaultFileName={`manga-page-${pageId}`}
            />
        </div>
    );
}

export default MangaEditorEnhanced;
