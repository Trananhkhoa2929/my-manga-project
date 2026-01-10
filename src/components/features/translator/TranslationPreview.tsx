'use client'

// ===========================================
// TRANSLATION PREVIEW COMPONENT (ENHANCED)
// Side-by-side preview with API-processed image
// ===========================================

import React, { useEffect, useRef } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Layers, Eye, EyeOff, Maximize2 } from 'lucide-react'
import { useTranslatorStore } from '@/lib/stores/translatorStore'

export function TranslationPreview() {
    const {
        originalImage,
        processedImageUrl,
        detectedBubbles,
        selectedBubbleId,
        selectBubble,
    } = useTranslatorStore()

    const [zoom, setZoom] = React.useState(1)
    const [showOverlay, setShowOverlay] = React.useState(true)
    const [viewMode, setViewMode] = React.useState<'split' | 'original' | 'translated'>('split')
    const containerRef = useRef<HTMLDivElement>(null)

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25))
    const handleResetZoom = () => setZoom(1)

    // Fit to container width
    const handleFitToWidth = () => {
        if (containerRef.current && originalImage) {
            const containerWidth = containerRef.current.clientWidth
            const imageWidth = originalImage.width
            setZoom(Math.min(containerWidth / imageWidth * 0.45, 1))
        }
    }

    useEffect(() => {
        handleFitToWidth()
    }, [originalImage])

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-700">
                        <button
                            onClick={() => setViewMode('split')}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'split' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            So sánh
                        </button>
                        <button
                            onClick={() => setViewMode('original')}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'original' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            Gốc
                        </button>
                        <button
                            onClick={() => setViewMode('translated')}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'translated' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            disabled={!processedImageUrl}
                        >
                            Đã dịch
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <button
                        onClick={handleZoomOut}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-4 h-4 text-gray-300" />
                    </button>
                    <span className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm text-gray-300 font-mono min-w-[60px] text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Reset Zoom"
                    >
                        <RotateCcw className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                        onClick={handleFitToWidth}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Fit to Width"
                    >
                        <Maximize2 className="w-4 h-4 text-gray-300" />
                    </button>

                    <div className="w-px h-6 bg-gray-700 mx-1" />

                    {/* Overlay Toggle */}
                    <button
                        onClick={() => setShowOverlay(!showOverlay)}
                        className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
              ${showOverlay ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}
            `}
                        title="Toggle Overlay"
                    >
                        {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="text-sm hidden sm:inline">Overlay</span>
                    </button>
                </div>
            </div>

            {/* Preview Grid */}
            <div
                ref={containerRef}
                className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}
            >
                {/* Original Image */}
                {(viewMode === 'split' || viewMode === 'original') && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Ảnh gốc
                        </h4>
                        <div
                            className="relative overflow-auto bg-gray-950 rounded-xl border border-gray-700 max-h-[600px]"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}
                        >
                            {originalImage ? (
                                <div
                                    className="relative inline-block transition-transform"
                                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                                >
                                    <img
                                        src={originalImage.url}
                                        alt="Original manga"
                                        className="max-w-none"
                                        draggable={false}
                                    />
                                    {/* Bubble Overlay */}
                                    {showOverlay && detectedBubbles.map((bubble, index) => (
                                        <div
                                            key={bubble.id}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                selectBubble(bubble.id)
                                            }}
                                            className={`
                        absolute border-2 cursor-pointer transition-all
                        ${selectedBubbleId === bubble.id
                                                    ? 'border-purple-500 bg-purple-500/30 shadow-lg shadow-purple-500/20'
                                                    : 'border-green-500/60 bg-green-500/10 hover:border-green-400 hover:bg-green-500/20'
                                                }
                      `}
                                            style={{
                                                left: bubble.boundingBox.x,
                                                top: bubble.boundingBox.y,
                                                width: bubble.boundingBox.width,
                                                height: bubble.boundingBox.height,
                                                borderRadius: bubble.shape === 'ellipse' ? '50%' : '8px',
                                            }}
                                        >
                                            <span className={`
                        absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 
                        ${selectedBubbleId === bubble.id ? 'bg-purple-600' : 'bg-green-600'} 
                        text-white text-xs rounded-full font-bold shadow-lg
                      `}>
                                                {index + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-500">
                                    Chưa có ảnh
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Processed Image */}
                {(viewMode === 'split' || viewMode === 'translated') && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Ảnh đã dịch
                        </h4>
                        <div
                            className="relative overflow-auto bg-gray-950 rounded-xl border border-gray-700 max-h-[600px]"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}
                        >
                            {processedImageUrl ? (
                                <div
                                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                                    className="transition-transform"
                                >
                                    <img
                                        src={processedImageUrl}
                                        alt="Translated manga"
                                        className="max-w-none"
                                        draggable={false}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
                                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                        <Layers className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <p className="text-sm">Nhấn "Tạo Ảnh Dịch" để xem kết quả</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TranslationPreview
