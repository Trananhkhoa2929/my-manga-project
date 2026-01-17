// ===========================================
// MANGA EDITOR INTEGRATION EXAMPLE
// Shows how to integrate CleaningLayer
// ===========================================

/*
 * This file shows how to integrate the CleaningLayer into MangaEditor.
 * 
 * Key Architecture:
 * - Layer 0: Background Image
 * - Layer 1: CleaningLayer (manual brush strokes)
 * - Layer 2: Shapes/Masks
 * - Layer 3: Text Layer (on top of cleaning)
 * - Layer 4: Transformer
 */

import React, { useState, useRef } from 'react'
import { Stage, Layer, Image as KonvaImage, Text, Group, Transformer } from 'react-konva'
import Konva from 'konva'

// Import the cleaning layer components
import {
    CleaningLayer,
    CleaningToolbar,
    useCleaningTools,
    CleaningTool,
    CleaningStroke
} from './CleaningLayer'

// ===========================================
// EDITOR MODES
// ===========================================

type EditorMode = 'select' | 'cleaning' | 'text' | 'shape'

// ===========================================
// INTEGRATION SNIPPET
// ===========================================

interface IntegratedEditorProps {
    imageUrl: string
    width?: number
    height?: number
}

export const MangaEditorWithCleaning: React.FC<IntegratedEditorProps> = ({
    imageUrl,
    width = 800,
    height = 600,
}) => {
    // Editor state
    const [editorMode, setEditorMode] = useState<EditorMode>('cleaning')
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const stageRef = useRef<Konva.Stage>(null)

    // Use the cleaning tools hook
    const cleaningTools = useCleaningTools([])

    // Determine if cleaning layer should be active
    const isCleaningActive = editorMode === 'cleaning'

    return (
        <div className="relative">
            {/* Mode switcher */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
                <button
                    onClick={() => setEditorMode('select')}
                    className={`px-3 py-2 rounded-lg text-sm ${editorMode === 'select'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                >
                    🖱️ Select
                </button>
                <button
                    onClick={() => setEditorMode('cleaning')}
                    className={`px-3 py-2 rounded-lg text-sm ${editorMode === 'cleaning'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                >
                    🧹 Cleaning
                </button>
                <button
                    onClick={() => setEditorMode('text')}
                    className={`px-3 py-2 rounded-lg text-sm ${editorMode === 'text'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                >
                    📝 Text
                </button>
            </div>

            {/* Cleaning toolbar (only when in cleaning mode) */}
            {editorMode === 'cleaning' && (
                <div className="absolute top-4 right-4 z-20">
                    <CleaningToolbar
                        currentTool={cleaningTools.currentTool}
                        brushSize={cleaningTools.brushSize}
                        canUndo={cleaningTools.canUndo}
                        canRedo={cleaningTools.canRedo}
                        onToolChange={cleaningTools.setCurrentTool}
                        onBrushSizeChange={cleaningTools.setBrushSize}
                        onUndo={cleaningTools.undo}
                        onRedo={cleaningTools.redo}
                        onClearAll={cleaningTools.clearAll}
                    />
                </div>
            )}

            {/* Konva Stage */}
            <Stage
                ref={stageRef}
                width={width}
                height={height}
                style={{
                    cursor: isCleaningActive ? 'none' : 'default'
                }}
            >
                {/* Layer 0: Background Image */}
                <Layer listening={false}>
                    {image && (
                        <KonvaImage
                            image={image}
                            width={width}
                            height={height}
                        />
                    )}
                </Layer>

                {/* Layer 1: Cleaning Layer (manual brush strokes) */}
                <CleaningLayer
                    width={width}
                    height={height}
                    scale={1}
                    isActive={isCleaningActive}
                    strokes={cleaningTools.strokes}
                    onStrokesChange={cleaningTools.setStrokes}
                    currentTool={cleaningTools.currentTool}
                    brushSize={cleaningTools.brushSize}
                    cursorPosition={cleaningTools.cursorPosition}
                    onCursorMove={cleaningTools.setCursorPosition}
                />

                {/* Layer 2: Text Layer (on top of cleaning) */}
                <Layer>
                    {/* Text elements go here */}
                    {/* They will appear ON TOP of the cleaning strokes */}
                </Layer>

                {/* Layer 3: Transformer */}
                <Layer>
                    {/* Transformer for resizing elements */}
                </Layer>
            </Stage>

            {/* Status bar */}
            <div className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-gray-800/80 rounded-lg text-sm text-gray-400">
                <span>Mode: <span className="text-white">{editorMode}</span></span>
                {editorMode === 'cleaning' && (
                    <>
                        <span className="mx-2">•</span>
                        <span>Tool: <span className="text-white">{cleaningTools.currentTool}</span></span>
                        <span className="mx-2">•</span>
                        <span>Strokes: <span className="text-blue-400">{cleaningTools.strokes.length}</span></span>
                    </>
                )}
            </div>
        </div>
    )
}

export default MangaEditorWithCleaning

/*
 * ===========================================
 * HOW TO USE IN EXISTING MangaEditor.tsx
 * ===========================================
 * 
 * 1. Import the components:
 *    import { CleaningLayer, CleaningToolbar, useCleaningTools } from './CleaningLayer'
 * 
 * 2. Add the hook inside MangaEditor:
 *    const cleaningTools = useCleaningTools(initialCanvasData?.cleaningStrokes || [])
 * 
 * 3. Add a new editor mode for cleaning:
 *    const [editorMode, setEditorMode] = useState<'select' | 'cleaning' | 'text'>('select')
 * 
 * 4. Replace the old brush Layer with CleaningLayer:
 *    <CleaningLayer
 *        width={stageSize.width}
 *        height={stageSize.height}
 *        scale={scale}
 *        isActive={editorMode === 'cleaning'}
 *        strokes={cleaningTools.strokes}
 *        onStrokesChange={cleaningTools.setStrokes}
 *        currentTool={cleaningTools.currentTool}
 *        brushSize={cleaningTools.brushSize}
 *        cursorPosition={cleaningTools.cursorPosition}
 *        onCursorMove={cleaningTools.setCursorPosition}
 *    />
 * 
 * 5. Add CleaningToolbar in the UI:
 *    {editorMode === 'cleaning' && (
 *        <CleaningToolbar ... />
 *    )}
 * 
 * 6. Update the save function to include cleaning strokes:
 *    cleaningStrokes: cleaningTools.strokes
 */
