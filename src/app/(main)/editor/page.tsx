'use client'

// ===========================================
// EDITOR DEMO PAGE
// Test the MangaEditor component
// ===========================================

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import type { CanvasData } from '@/components/features/editor/MangaEditor'
import { ArrowLeft, Upload, Sparkles } from 'lucide-react'
import Link from 'next/link'

// Dynamic import to avoid SSR issues with Konva
const MangaEditor = dynamic(
    () => import('@/components/features/editor/MangaEditor').then(mod => mod.MangaEditor),
    { ssr: false, loading: () => <EditorSkeleton /> }
)

function EditorSkeleton() {
    return (
        <div className="w-full h-[600px] bg-gray-800 rounded-xl animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Loading Editor...</div>
        </div>
    )
}

// Sample manga page for testing
const SAMPLE_IMAGES = [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80', // Anime style
    'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&q=80', // Manga art
    'https://images.unsplash.com/photo-1560972550-aba3456b5564?w=800&q=80', // Comic style
]

export default function EditorDemoPage() {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [savedData, setSavedData] = useState<CanvasData | null>(null)

    const handleSave = (canvasData: CanvasData) => {
        setSavedData(canvasData)
        console.log('Canvas data saved:', canvasData)
        // In production, this would save to the database
    }

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

                    {savedData && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>Saved! ({savedData.textElements.length} texts, {savedData.brushStrokes.length} strokes)</span>
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
                                { icon: '✏️', title: 'Text Tool', desc: 'Horizontal & Vertical' },
                                { icon: '🖌️', title: 'Brush/Pen', desc: 'Clean artifacts' },
                                { icon: '◻️', title: 'Shape Tools', desc: 'Cover complex areas' },
                                { icon: '🔄', title: 'Transform', desc: 'Resize & rotate' },
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
                            initialCanvasData={savedData || undefined}
                            onSave={handleSave}
                            width={1200}
                            height={800}
                        />
                    </div>
                )}
            </main>
        </div>
    )
}
