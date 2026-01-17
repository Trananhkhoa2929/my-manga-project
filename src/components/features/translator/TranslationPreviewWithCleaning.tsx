'use client'

// ===========================================
// TRANSLATION PREVIEW WITH MANUAL CLEANING
// Allows users to manually fix AI OCR/translation errors
// ===========================================

import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Layers,
    Eye,
    EyeOff,
    Maximize2,
    PenTool,
    Eraser,
} from 'lucide-react'
import { useTranslatorStore } from '@/lib/stores/translatorStore'
import {
    CleaningToolbar,
    useCleaningTools,
    CleaningTool,
    CleaningStroke,
} from '@/components/features/editor/CleaningLayer'

// Canvas-based cleaning layer for the translator
interface CanvasCleaningLayerProps {
    imageUrl: string
    width: number
    height: number
    strokes: CleaningStroke[]
    currentTool: CleaningTool
    brushSize: number
    isActive: boolean
    onStrokesChange: (strokes: CleaningStroke[]) => void
}

function CanvasCleaningLayer({
    imageUrl,
    width,
    height,
    strokes,
    currentTool,
    brushSize,
    isActive,
    onStrokesChange,
}: CanvasCleaningLayerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentStroke, setCurrentStroke] = useState<CleaningStroke | null>(null)
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
    const [image, setImage] = useState<HTMLImageElement | null>(null)

    // Load image
    useEffect(() => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = imageUrl
        img.onload = () => setImage(img)
    }, [imageUrl])

    // Render canvas
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !image) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear and draw image
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(image, 0, 0, width, height)

        // Draw completed strokes
        for (const stroke of strokes) {
            drawStroke(ctx, stroke)
        }

        // Draw current stroke
        if (currentStroke) {
            drawStroke(ctx, currentStroke)
        }

        // Draw cursor
        if (isActive && cursorPos) {
            ctx.save()
            ctx.strokeStyle = currentTool === 'erase' ? '#FF6B6B' : currentTool === 'draw' ? '#333' : '#999'
            ctx.lineWidth = 1
            ctx.setLineDash([4, 4])
            ctx.beginPath()
            ctx.arc(cursorPos.x, cursorPos.y, brushSize / 2, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
        }
    }, [image, strokes, currentStroke, cursorPos, isActive, currentTool, brushSize, width, height])

    const drawStroke = (ctx: CanvasRenderingContext2D, stroke: CleaningStroke) => {
        if (stroke.points.length < 4) return

        ctx.save()
        ctx.globalCompositeOperation = stroke.globalCompositeOperation
        ctx.strokeStyle = stroke.color
        ctx.lineWidth = stroke.size
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        ctx.moveTo(stroke.points[0], stroke.points[1])

        for (let i = 2; i < stroke.points.length; i += 2) {
            ctx.lineTo(stroke.points[i], stroke.points[i + 1])
        }
        ctx.stroke()
        ctx.restore()
    }

    const getToolColor = (tool: CleaningTool): string => {
        switch (tool) {
            case 'clean': return '#FFFFFF'
            case 'draw': return '#000000'
            case 'erase': return '#FFFFFF'
            default: return '#FFFFFF'
        }
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isActive) return

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setIsDrawing(true)
        setCurrentStroke({
            id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tool: currentTool,
            points: [x, y],
            color: getToolColor(currentTool),
            size: brushSize,
            tension: 0.4,
            globalCompositeOperation: currentTool === 'erase' ? 'destination-out' : 'source-over',
        })
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setCursorPos({ x, y })

        if (!isDrawing || !currentStroke || !isActive) return

        setCurrentStroke(prev => {
            if (!prev) return null
            return {
                ...prev,
                points: [...prev.points, x, y],
            }
        })
    }

    const handleMouseUp = () => {
        if (!isDrawing || !currentStroke) return
        setIsDrawing(false)

        if (currentStroke.points.length >= 4) {
            onStrokesChange([...strokes, currentStroke])
        }
        setCurrentStroke(null)
    }

    const handleMouseLeave = () => {
        setCursorPos(null)
        if (isDrawing && currentStroke && currentStroke.points.length >= 4) {
            onStrokesChange([...strokes, currentStroke])
        }
        setIsDrawing(false)
        setCurrentStroke(null)
    }

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: isActive ? 'none' : 'default' }}
            className="max-w-none"
        />
    )
}

export function TranslationPreviewWithCleaning() {
    const {
        originalImage,
        processedImageUrl,
        detectedBubbles,
        selectedBubbleId,
        selectBubble,
    } = useTranslatorStore()

    const [zoom, setZoom] = useState(1)
    const [showOverlay, setShowOverlay] = useState(true)
    const [viewMode, setViewMode] = useState<'split' | 'original' | 'translated'>('split')
    const [cleaningMode, setCleaningMode] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Cleaning tools hook
    const cleaningTools = useCleaningTools([])

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25))
    const handleResetZoom = () => setZoom(1)

    const handleFitToWidth = useCallback(() => {
        if (containerRef.current && originalImage) {
            const containerWidth = containerRef.current.clientWidth
            const imageWidth = originalImage.width
            setZoom(Math.min(containerWidth / imageWidth * 0.45, 1))
        }
    }, [originalImage])

    useEffect(() => {
        handleFitToWidth()
    }, [handleFitToWidth])

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

                    {/* Cleaning Mode Toggle */}
                    <button
                        onClick={() => setCleaningMode(!cleaningMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${cleaningMode
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        title="Toggle Manual Cleaning Mode"
                    >
                        <PenTool className="w-4 h-4" />
                        <span className="hidden sm:inline">Sửa Tay</span>
                    </button>
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

            {/* Cleaning Toolbar - shown when cleaning mode is active */}
            {cleaningMode && (
                <div className="p-4 bg-gray-900/50 border border-orange-500/30 rounded-xl">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-orange-400 font-medium">🧹 Chế độ sửa tay:</span>
                        </div>

                        {/* Tool buttons */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => cleaningTools.setCurrentTool('clean')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${cleaningTools.currentTool === 'clean'
                                    ? 'bg-white text-gray-900'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                ⬜ Tẩy trắng (B)
                            </button>
                            <button
                                onClick={() => cleaningTools.setCurrentTool('draw')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${cleaningTools.currentTool === 'draw'
                                    ? 'bg-gray-900 text-white border border-gray-600'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                ⬛ Vẽ đen (D)
                            </button>
                            <button
                                onClick={() => cleaningTools.setCurrentTool('erase')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${cleaningTools.currentTool === 'erase'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                🧽 Tẩy (E)
                            </button>
                        </div>

                        {/* Brush size */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Size:</span>
                            <input
                                type="range"
                                min="2"
                                max="60"
                                value={cleaningTools.brushSize}
                                onChange={(e) => cleaningTools.setBrushSize(Number(e.target.value))}
                                className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <span className="text-xs text-gray-300 w-8">{cleaningTools.brushSize}px</span>
                        </div>

                        {/* Undo/Redo */}
                        <div className="flex gap-1">
                            <button
                                onClick={cleaningTools.undo}
                                disabled={!cleaningTools.canUndo}
                                className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm disabled:opacity-40"
                            >
                                ↩️
                            </button>
                            <button
                                onClick={cleaningTools.redo}
                                disabled={!cleaningTools.canRedo}
                                className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm disabled:opacity-40"
                            >
                                ↪️
                            </button>
                            {cleaningTools.strokes.length > 0 && (
                                <button
                                    onClick={cleaningTools.clearAll}
                                    className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm"
                                >
                                    🗑️ Xóa hết
                                </button>
                            )}
                        </div>

                        <span className="text-xs text-gray-500">Strokes: {cleaningTools.strokes.length}</span>
                    </div>
                </div>
            )}

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

                {/* Processed Image with Cleaning Layer */}
                {(viewMode === 'split' || viewMode === 'translated') && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Ảnh đã dịch
                            {cleaningMode && (
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full animate-pulse">
                                    ✏️ Đang sửa
                                </span>
                            )}
                        </h4>
                        <div
                            className={`relative overflow-auto bg-gray-950 rounded-xl border max-h-[600px] ${cleaningMode
                                ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                                : 'border-gray-700'
                                }`}
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}
                        >
                            {processedImageUrl ? (
                                <div
                                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                                    className="transition-transform inline-block"
                                >
                                    {cleaningMode && originalImage ? (
                                        // Canvas-based cleaning layer
                                        <CanvasCleaningLayer
                                            imageUrl={processedImageUrl}
                                            width={originalImage.width}
                                            height={originalImage.height}
                                            strokes={cleaningTools.strokes}
                                            currentTool={cleaningTools.currentTool}
                                            brushSize={cleaningTools.brushSize}
                                            isActive={true}
                                            onStrokesChange={cleaningTools.setStrokes}
                                        />
                                    ) : (
                                        // Normal image view
                                        <img
                                            src={processedImageUrl}
                                            alt="Translated manga"
                                            className="max-w-none"
                                            draggable={false}
                                        />
                                    )}
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

export default TranslationPreviewWithCleaning
