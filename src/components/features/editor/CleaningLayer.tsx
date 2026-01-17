// ===========================================
// CLEANING LAYER - Manual Restoration System
// Professional brush tools for manga cleaning
// ===========================================

import React, { useRef, useState, useEffect, useCallback, memo } from 'react'
import { Layer, Line, Circle } from 'react-konva'
import Konva from 'konva'

// ===========================================
// TYPES
// ===========================================

export type CleaningTool = 'clean' | 'draw' | 'erase'

export interface CleaningStroke {
    id: string
    tool: CleaningTool
    points: number[]
    color: string
    size: number
    tension: number
    globalCompositeOperation: GlobalCompositeOperation
}

export interface CleaningLayerState {
    currentTool: CleaningTool
    brushSize: number
    history: CleaningStroke[]
    historyIndex: number // For redo support
}

interface CleaningLayerProps {
    width: number
    height: number
    scale: number
    isActive: boolean // Only respond to events when active
    strokes: CleaningStroke[]
    onStrokesChange: (strokes: CleaningStroke[]) => void
    currentTool: CleaningTool
    brushSize: number
    cursorPosition: { x: number; y: number } | null
    onCursorMove: (pos: { x: number; y: number } | null) => void
}

// ===========================================
// CLEANING LAYER COMPONENT
// Optimized: Only re-renders when strokes change
// ===========================================

export const CleaningLayer = memo<CleaningLayerProps>(({
    width,
    height,
    scale,
    isActive,
    strokes,
    onStrokesChange,
    currentTool,
    brushSize,
    cursorPosition,
    onCursorMove,
}) => {
    const isDrawing = useRef(false)
    const [currentStroke, setCurrentStroke] = useState<CleaningStroke | null>(null)

    // Get color based on tool
    const getToolColor = useCallback((tool: CleaningTool): string => {
        switch (tool) {
            case 'clean': return '#FFFFFF' // White for cleaning
            case 'draw': return '#000000'  // Black for redrawing lines
            case 'erase': return '#FFFFFF' // Eraser (uses destination-out)
            default: return '#FFFFFF'
        }
    }, [])

    // Get composite operation based on tool
    const getCompositeOp = useCallback((tool: CleaningTool): GlobalCompositeOperation => {
        return tool === 'erase' ? 'destination-out' : 'source-over'
    }, [])

    // Handle mouse down - start stroke
    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isActive) return

        const stage = e.target.getStage()
        const pos = stage?.getPointerPosition()
        if (!pos) return

        isDrawing.current = true

        const newStroke: CleaningStroke = {
            id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tool: currentTool,
            points: [pos.x / scale, pos.y / scale],
            color: getToolColor(currentTool),
            size: brushSize,
            tension: 0.4, // Smooth bezier curves
            globalCompositeOperation: getCompositeOp(currentTool),
        }

        setCurrentStroke(newStroke)
    }, [isActive, currentTool, brushSize, scale, getToolColor, getCompositeOp])

    // Handle mouse move - add points with smoothing
    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage()
        const pos = stage?.getPointerPosition()

        if (pos) {
            onCursorMove({ x: pos.x, y: pos.y })
        }

        if (!isDrawing.current || !currentStroke || !isActive) return
        if (!pos) return

        // Add point with minimal distance check for performance
        const lastX = currentStroke.points[currentStroke.points.length - 2]
        const lastY = currentStroke.points[currentStroke.points.length - 1]
        const newX = pos.x / scale
        const newY = pos.y / scale

        // Only add point if moved enough (reduces point count)
        const distance = Math.sqrt((newX - lastX) ** 2 + (newY - lastY) ** 2)
        if (distance > 2) {
            setCurrentStroke(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    points: [...prev.points, newX, newY],
                }
            })
        }
    }, [isActive, currentStroke, scale, onCursorMove])

    // Handle mouse up - complete stroke
    const handleMouseUp = useCallback(() => {
        if (!isDrawing.current || !currentStroke) return
        isDrawing.current = false

        // Only add stroke if it has enough points
        if (currentStroke.points.length >= 4) {
            onStrokesChange([...strokes, currentStroke])
        }
        setCurrentStroke(null)
    }, [currentStroke, strokes, onStrokesChange])

    // Handle mouse leave
    const handleMouseLeave = useCallback(() => {
        onCursorMove(null)
        if (isDrawing.current && currentStroke) {
            // Complete stroke when leaving
            if (currentStroke.points.length >= 4) {
                onStrokesChange([...strokes, currentStroke])
            }
        }
        isDrawing.current = false
        setCurrentStroke(null)
    }, [currentStroke, strokes, onStrokesChange, onCursorMove])

    return (
        <Layer
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            {/* Render completed strokes */}
            {strokes.map((stroke) => (
                <Line
                    key={stroke.id}
                    points={stroke.points.map(p => p * scale)}
                    stroke={stroke.color}
                    strokeWidth={stroke.size * scale}
                    tension={stroke.tension}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation={stroke.globalCompositeOperation}
                    listening={false} // Optimization: don't listen to events
                    perfectDrawEnabled={false} // Optimization
                />
            ))}

            {/* Render current stroke being drawn */}
            {currentStroke && (
                <Line
                    points={currentStroke.points.map(p => p * scale)}
                    stroke={currentStroke.color}
                    strokeWidth={currentStroke.size * scale}
                    tension={currentStroke.tension}
                    lineCap="round"
                    lineJoin="round"
                    listening={false}
                    perfectDrawEnabled={false}
                />
            )}

            {/* Dynamic cursor - shows brush size */}
            {isActive && cursorPosition && (
                <Circle
                    x={cursorPosition.x}
                    y={cursorPosition.y}
                    radius={brushSize * scale / 2}
                    stroke={currentTool === 'erase' ? '#FF6B6B' : currentTool === 'draw' ? '#333' : '#999'}
                    strokeWidth={1}
                    dash={[4, 4]}
                    listening={false}
                    perfectDrawEnabled={false}
                />
            )}
        </Layer>
    )
})

CleaningLayer.displayName = 'CleaningLayer'

// ===========================================
// CLEANING TOOLBAR COMPONENT
// ===========================================

interface CleaningToolbarProps {
    currentTool: CleaningTool
    brushSize: number
    canUndo: boolean
    canRedo: boolean
    onToolChange: (tool: CleaningTool) => void
    onBrushSizeChange: (size: number) => void
    onUndo: () => void
    onRedo: () => void
    onClearAll: () => void
}

export const CleaningToolbar: React.FC<CleaningToolbarProps> = ({
    currentTool,
    brushSize,
    canUndo,
    canRedo,
    onToolChange,
    onBrushSizeChange,
    onUndo,
    onRedo,
    onClearAll,
}) => {
    return (
        <div className="flex flex-col gap-3 p-3 bg-gray-800/95 rounded-xl border border-gray-700">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                🧹 Manual Cleaning
            </div>

            {/* Tool buttons */}
            <div className="flex gap-1">
                <button
                    onClick={() => onToolChange('clean')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentTool === 'clean'
                            ? 'bg-white text-gray-900 shadow-lg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    title="White Brush (B) - Cover leftover text"
                >
                    ⬜ Clean
                </button>
                <button
                    onClick={() => onToolChange('draw')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentTool === 'draw'
                            ? 'bg-gray-900 text-white shadow-lg border border-gray-600'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    title="Black Brush (D) - Redraw lines"
                >
                    ⬛ Draw
                </button>
                <button
                    onClick={() => onToolChange('erase')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentTool === 'erase'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    title="Eraser (E) - Remove strokes"
                >
                    🧽 Erase
                </button>
            </div>

            {/* Brush size */}
            <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Brush Size</span>
                    <span>{brushSize}px</span>
                </div>
                <input
                    type="range"
                    min="2"
                    max="100"
                    value={brushSize}
                    onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>[ / ]</span>
                    <span>Hotkeys</span>
                </div>
            </div>

            {/* Undo/Redo */}
            <div className="flex gap-2">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${canUndo
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                    title="Undo (Ctrl+Z)"
                >
                    ↩️ Undo
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${canRedo
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                    title="Redo (Ctrl+Y)"
                >
                    ↪️ Redo
                </button>
            </div>

            {/* Clear all */}
            <button
                onClick={onClearAll}
                className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-all border border-red-500/30"
            >
                🗑️ Clear All Cleaning
            </button>

            {/* Hotkeys hint */}
            <div className="text-xs text-gray-500 space-y-1">
                <div><kbd className="px-1 bg-gray-700 rounded">B</kbd> White brush</div>
                <div><kbd className="px-1 bg-gray-700 rounded">D</kbd> Black brush</div>
                <div><kbd className="px-1 bg-gray-700 rounded">E</kbd> Eraser</div>
                <div><kbd className="px-1 bg-gray-700 rounded">[</kbd><kbd className="px-1 bg-gray-700 rounded">]</kbd> Size</div>
            </div>
        </div>
    )
}

// ===========================================
// CUSTOM HOOK: useCleaningTools
// Manages cleaning state with undo/redo
// ===========================================

export interface UseCleaningToolsReturn {
    strokes: CleaningStroke[]
    currentTool: CleaningTool
    brushSize: number
    canUndo: boolean
    canRedo: boolean
    cursorPosition: { x: number; y: number } | null
    setStrokes: (strokes: CleaningStroke[]) => void
    setCurrentTool: (tool: CleaningTool) => void
    setBrushSize: (size: number) => void
    setCursorPosition: (pos: { x: number; y: number } | null) => void
    undo: () => void
    redo: () => void
    clearAll: () => void
}

export function useCleaningTools(initialStrokes: CleaningStroke[] = []): UseCleaningToolsReturn {
    const [strokes, setStrokesState] = useState<CleaningStroke[]>(initialStrokes)
    const [history, setHistory] = useState<CleaningStroke[][]>([initialStrokes])
    const [historyIndex, setHistoryIndex] = useState(0)
    const [currentTool, setCurrentTool] = useState<CleaningTool>('clean')
    const [brushSize, setBrushSize] = useState(20)
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null)

    // Update strokes and add to history
    const setStrokes = useCallback((newStrokes: CleaningStroke[]) => {
        setStrokesState(newStrokes)

        // Truncate future history and add new state
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newStrokes)

        // Limit history size
        if (newHistory.length > 50) {
            newHistory.shift()
        }

        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
    }, [history, historyIndex])

    // Undo
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1
            setHistoryIndex(newIndex)
            setStrokesState(history[newIndex])
        }
    }, [history, historyIndex])

    // Redo
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1
            setHistoryIndex(newIndex)
            setStrokesState(history[newIndex])
        }
    }, [history, historyIndex])

    // Clear all
    const clearAll = useCallback(() => {
        setStrokes([])
    }, [setStrokes])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            const key = e.key.toLowerCase()

            // Tool switching
            if (key === 'b') {
                setCurrentTool('clean')
            } else if (key === 'd') {
                setCurrentTool('draw')
            } else if (key === 'e') {
                setCurrentTool('erase')
            }

            // Brush size
            if (key === '[') {
                setBrushSize(prev => Math.max(2, prev - 5))
            } else if (key === ']') {
                setBrushSize(prev => Math.min(100, prev + 5))
            }

            // Undo/Redo
            if ((e.ctrlKey || e.metaKey) && key === 'z') {
                e.preventDefault()
                if (e.shiftKey) {
                    redo()
                } else {
                    undo()
                }
            }
            if ((e.ctrlKey || e.metaKey) && key === 'y') {
                e.preventDefault()
                redo()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [undo, redo])

    return {
        strokes,
        currentTool,
        brushSize,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        cursorPosition,
        setStrokes,
        setCurrentTool,
        setBrushSize,
        setCursorPosition,
        undo,
        redo,
        clearAll,
    }
}

export default CleaningLayer
