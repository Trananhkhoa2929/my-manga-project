'use client'

// ===========================================
// EDITOR DEMO PAGE
// Test the MangaEditor component with enhanced features
// ===========================================

import React, { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ArrowLeft, Upload, Sparkles, Undo2, Redo2, Save, Download, Clock } from 'lucide-react'
import Link from 'next/link'
import { useHistory } from '@/features/editor/hooks/use-history'
import { useAutoSave, getSaveStatusText, getSaveStatusColor } from '@/features/editor/hooks/use-auto-save'

// Dynamic import to avoid SSR issues with Konva
const MangaEditor = dynamic(
    () => import('@/components/features/editor/MangaEditor').then(mod => mod.MangaEditor),
    { ssr: false, loading: () => <EditorSkeleton /> }
)

// Import CanvasData type from MangaEditor
import type { CanvasData } from '@/components/features/editor/MangaEditor'

function EditorSkeleton() {
    return (
        <div className="w-full h-[600px] bg-gray-800 rounded-xl animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Loading Editor...</div>
        </div>
    )
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

// Sample manga page for testing
const SAMPLE_IMAGES = [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&q=80',
    'https://images.unsplash.com/photo-1560972550-aba3456b5564?w=800&q=80',
]

export default function EditorDemoPage() {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [pageId] = useState(() => `page-${Date.now()}`)
    const [isMounted, setIsMounted] = useState(false)

    // History hook for undo/redo
    const {
        state: canvasData,
        setState: setCanvasData,
        undo,
        redo,
        canUndo,
        canRedo,
        historyLength,
    } = useHistory<CanvasData>(defaultCanvasData, { maxHistory: 50 });

    // Auto-save hook
    const {
        saveState,
        save: triggerSave,
        recover,
        markChanged,
    } = useAutoSave<CanvasData>(canvasData, {
        storageKey: `manga-editor-${pageId}`,
        interval: 30000,
        debounceDelay: 2000,
        enabled: true,
    });

    useEffect(() => {
        setIsMounted(true);
        // Check for recovery data
        const recovered = recover();
        if (recovered) {
            const shouldRecover = window.confirm(
                'Phát hiện dữ liệu chưa lưu từ phiên trước. Bạn có muốn khôi phục không?'
            );
            if (shouldRecover) {
                setCanvasData(recovered);
            }
        }
    }, []);

    // Track if we're in the middle of undo/redo to skip recording
    const skipNextHistoryRef = useRef(false)

    // Handle state changes from editor - record to history
    const handleStateChange = useCallback((data: CanvasData) => {
        // Skip if this change was triggered by undo/redo
        if (skipNextHistoryRef.current) {
            skipNextHistoryRef.current = false
            return
        }
        setCanvasData(data)
        markChanged()
    }, [setCanvasData, markChanged])

    // Handle save from editor (explicit save button)
    const handleEditorSave = useCallback((data: CanvasData) => {
        console.log('Canvas data saved:', data);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                skipNextHistoryRef.current = true  // Skip recording the state change
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                skipNextHistoryRef.current = true  // Skip recording the state change
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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setImageUrl(url)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dich-truyen"
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </Link>
                        <div className="w-px h-6 bg-gray-700" />
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            Manga Editor
                            <span className="px-2 py-0.5 bg-purple-600 rounded-full text-xs font-bold">BETA</span>
                        </h1>
                    </div>

                    {/* Enhanced Toolbar - Always visible in header when editing */}
                    {imageUrl && isMounted && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/95 rounded-xl border border-gray-700">
                            {/* Undo */}
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${canUndo ? 'hover:bg-gray-700 text-white' : 'text-gray-600 cursor-not-allowed'
                                    }`}
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo2 className="w-4 h-4" />
                                <span className="text-sm">Undo</span>
                                {historyLength > 0 && (
                                    <span className="text-xs bg-gray-700 px-1.5 rounded">{historyLength}</span>
                                )}
                            </button>

                            {/* Redo */}
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${canRedo ? 'hover:bg-gray-700 text-white' : 'text-gray-600 cursor-not-allowed'
                                    }`}
                                title="Redo (Ctrl+Shift+Z)"
                            >
                                <Redo2 className="w-4 h-4" />
                                <span className="text-sm">Redo</span>
                            </button>

                            <div className="w-px h-6 bg-gray-600" />

                            {/* Save */}
                            <button
                                onClick={() => triggerSave()}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-700 ${getSaveStatusColor(saveState.status)}`}
                                title="Save (Ctrl+S)"
                            >
                                {saveState.status === 'saving' ? (
                                    <Clock className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span className="text-sm">{getSaveStatusText(saveState.status) || 'Save'}</span>
                            </button>

                            <div className="w-px h-6 bg-gray-600" />

                            {/* Export */}
                            <button
                                onClick={() => alert('Export feature coming soon!')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-700 text-white transition-colors"
                                title="Export"
                            >
                                <Download className="w-4 h-4" />
                                <span className="text-sm">Export</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {!imageUrl ? (
                    // Upload Section
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-4">Professional Manga Editor</h2>
                            <p className="text-gray-400 max-w-lg mx-auto">
                                Upload a manga page to start editing. Add text, clean bubbles with brush tool,
                                and overlay shapes to cover text in complex backgrounds.
                            </p>
                        </div>

                        {/* Upload Box */}
                        <label className="group relative w-full max-w-2xl h-64 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-800/50">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-12 h-12 text-gray-500 group-hover:text-purple-400 transition-colors mb-4" />
                            <span className="text-gray-400 group-hover:text-white transition-colors">
                                Click or drag to upload manga page
                            </span>
                            <span className="text-gray-600 text-sm mt-2">PNG, JPG up to 10MB</span>
                        </label>

                        {/* Sample Images */}
                        <div className="mt-12">
                            <h3 className="text-gray-400 text-sm mb-4 text-center">Or try with sample images:</h3>
                            <div className="flex gap-4">
                                {SAMPLE_IMAGES.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setImageUrl(url)}
                                        className="w-24 h-32 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-purple-500 transition-colors"
                                    >
                                        <img
                                            src={url}
                                            alt={`Sample ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
                            {[
                                { icon: '↩️', title: 'Undo/Redo', desc: 'Ctrl+Z / Ctrl+Y' },
                                { icon: '💾', title: 'Auto-Save', desc: 'Every 30 seconds' },
                                { icon: '📥', title: 'Export', desc: 'PNG, JPG, WebP' },
                                { icon: '🔄', title: 'Recovery', desc: 'Crash protection' },
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-gray-800/50 rounded-xl p-4 text-center">
                                    <div className="text-3xl mb-2">{feature.icon}</div>
                                    <div className="text-white font-medium">{feature.title}</div>
                                    <div className="text-gray-500 text-sm">{feature.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Editor Section
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => setImageUrl(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Change Image
                            </button>
                            <div className="text-gray-400 text-sm">
                                Press <kbd className="px-2 py-1 bg-gray-700 rounded">V</kbd> Select,
                                <kbd className="px-2 py-1 bg-gray-700 rounded ml-2">T</kbd> Text,
                                <kbd className="px-2 py-1 bg-gray-700 rounded ml-2">B</kbd> Brush,
                                <kbd className="px-2 py-1 bg-gray-700 rounded ml-2">E</kbd> Eraser
                            </div>
                        </div>

                        <MangaEditor
                            imageUrl={imageUrl}
                            initialCanvasData={canvasData}
                            onSave={handleEditorSave}
                            onStateChange={handleStateChange}
                            width={1200}
                            height={800}
                        />
                    </div>
                )}
            </main>
        </div>
    )
}


