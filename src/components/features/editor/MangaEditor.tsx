'use client'

// ===========================================
// MANGA EDITOR - Professional Web Editor
// React-Konva based with layering system
// ===========================================

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Rect, Ellipse, Text, Group, Transformer } from 'react-konva'
import Konva from 'konva'

// ===========================================
// TYPES
// ===========================================

export type EditorTool = 'select' | 'text' | 'brush' | 'eraser' | 'rectangle' | 'ellipse'

export interface TextElement {
    id: string
    x: number
    y: number
    width: number
    height: number
    text: string
    fontSize: number
    fontFamily: string
    fontStyle: string
    fill: string
    stroke: string
    strokeWidth: number
    isVertical: boolean
    rotation: number
    shadowColor: string
    shadowBlur: number
    shadowOffset: { x: number; y: number }
}

export interface BrushStroke {
    id: string
    points: number[]
    stroke: string
    strokeWidth: number
    tension: number
    lineCap: 'butt' | 'round' | 'square'
    lineJoin: 'round' | 'bevel' | 'miter'
    globalCompositeOperation: string
}

export interface ShapeElement {
    id: string
    type: 'rectangle' | 'ellipse'
    x: number
    y: number
    width: number
    height: number
    fill: string
    stroke: string
    strokeWidth: number
    rotation: number
}

export interface CanvasData {
    version: string
    layers: {
        background: { visible: boolean }
        drawing: { visible: boolean; strokes: BrushStroke[] }
        shapes: { visible: boolean; items: ShapeElement[] }
        text: { visible: boolean; items: TextElement[] }
    }
    textElements: TextElement[]
    brushStrokes: BrushStroke[]
    shapes: ShapeElement[]
}

interface MangaEditorProps {
    imageUrl: string
    initialCanvasData?: CanvasData
    onSave?: (canvasData: CanvasData) => void
    width?: number
    height?: number
}

// ===========================================
// VERTICAL TEXT COMPONENT
// ===========================================
interface VerticalTextProps {
    id?: string
    text: string
    x: number
    y: number
    fontSize: number
    fontFamily: string
    fill: string
    stroke?: string
    strokeWidth?: number
    width?: number
    height?: number
    shadowColor?: string
    shadowBlur?: number
    onClick?: () => void
    onDblClick?: () => void
    draggable?: boolean
    onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void
}

const VerticalText: React.FC<VerticalTextProps> = ({
    id,
    text,
    x,
    y,
    fontSize,
    fontFamily,
    fill,
    stroke,
    strokeWidth = 0,
    width = 100,
    height = 300,
    shadowColor,
    shadowBlur,
    onClick,
    onDblClick,
    draggable,
    onDragEnd,
}) => {
    // For vertical text, we render each character stacked vertically
    const chars = text.split('')
    const charHeight = fontSize * 1.2

    return (
        <Group
            id={id}
            x={x}
            y={y}
            width={width}
            height={height}
            draggable={draggable}
            onClick={onClick}
            onDblClick={onDblClick}
            onDragEnd={onDragEnd}
        >
            {chars.map((char, index) => (
                <Text
                    key={index}
                    x={0}
                    y={index * charHeight}
                    text={char}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    shadowColor={shadowColor}
                    shadowBlur={shadowBlur}
                    align="center"
                    width={fontSize}
                />
            ))}
        </Group>
    )
}

// ===========================================
// MAIN EDITOR COMPONENT
// ===========================================
export const MangaEditor: React.FC<MangaEditorProps> = ({
    imageUrl,
    initialCanvasData,
    onSave,
    width: containerWidth,
    height: containerHeight,
}) => {
    // Refs
    const stageRef = useRef<Konva.Stage>(null)
    const transformerRef = useRef<Konva.Transformer>(null)
    const isDrawing = useRef(false)

    // State
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
    const [scale, setScale] = useState(1)
    const [currentTool, setCurrentTool] = useState<EditorTool>('select')
    const [selectedId, setSelectedId] = useState<string | null>(null)

    // Drawing state
    const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>(
        initialCanvasData?.brushStrokes || []
    )
    const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null)

    // Text state
    const [textElements, setTextElements] = useState<TextElement[]>(
        initialCanvasData?.textElements || []
    )

    // Shape state
    const [shapes, setShapes] = useState<ShapeElement[]>(
        initialCanvasData?.shapes || []
    )

    // Tool settings
    const [brushColor, setBrushColor] = useState('#FFFFFF')
    const [brushSize, setBrushSize] = useState(20)
    const [isVerticalText, setIsVerticalText] = useState(false)

    // ===========================================
    // LOAD IMAGE
    // ===========================================
    useEffect(() => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.src = imageUrl
        img.onload = () => {
            setImage(img)

            // Calculate stage size based on image
            const maxWidth = containerWidth || 800
            const maxHeight = containerHeight || 600
            const imgRatio = img.width / img.height
            const containerRatio = maxWidth / maxHeight

            let newWidth, newHeight
            if (imgRatio > containerRatio) {
                newWidth = maxWidth
                newHeight = maxWidth / imgRatio
            } else {
                newHeight = maxHeight
                newWidth = maxHeight * imgRatio
            }

            setStageSize({ width: newWidth, height: newHeight })
            setScale(newWidth / img.width)
        }
    }, [imageUrl, containerWidth, containerHeight])

    // ===========================================
    // TRANSFORMER HANDLING
    // ===========================================
    useEffect(() => {
        if (!transformerRef.current) return

        const stage = stageRef.current
        if (!stage) return

        if (selectedId) {
            const selectedNode = stage.findOne(`#${selectedId}`)
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode])
                transformerRef.current.getLayer()?.batchDraw()
            }
        } else {
            transformerRef.current.nodes([])
        }
    }, [selectedId])

    // ===========================================
    // DRAWING HANDLERS
    // ===========================================
    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (currentTool !== 'brush' && currentTool !== 'eraser') return

        isDrawing.current = true
        const pos = e.target.getStage()?.getPointerPosition()
        if (!pos) return

        const newStroke: BrushStroke = {
            id: `stroke-${Date.now()}`,
            points: [pos.x / scale, pos.y / scale],
            stroke: currentTool === 'eraser' ? '#FFFFFF' : brushColor,
            strokeWidth: brushSize,
            tension: 0.5,
            lineCap: 'round',
            lineJoin: 'round',
            globalCompositeOperation: currentTool === 'eraser' ? 'destination-out' : 'source-over',
        }
        setCurrentStroke(newStroke)
    }, [currentTool, brushColor, brushSize, scale])

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isDrawing.current || !currentStroke) return
        if (currentTool !== 'brush' && currentTool !== 'eraser') return

        const pos = e.target.getStage()?.getPointerPosition()
        if (!pos) return

        setCurrentStroke({
            ...currentStroke,
            points: [...currentStroke.points, pos.x / scale, pos.y / scale],
        })
    }, [currentTool, currentStroke, scale])

    const handleMouseUp = useCallback(() => {
        if (!isDrawing.current || !currentStroke) return
        isDrawing.current = false

        setBrushStrokes(prev => [...prev, currentStroke])
        setCurrentStroke(null)
    }, [currentStroke])

    // ===========================================
    // STAGE CLICK HANDLERS
    // ===========================================
    const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        // Deselect when clicking on empty area
        if (e.target === e.target.getStage()) {
            setSelectedId(null)
        }

        // Add text on click when text tool is active
        if (currentTool === 'text') {
            const pos = e.target.getStage()?.getPointerPosition()
            if (!pos) return

            const newText: TextElement = {
                id: `text-${Date.now()}`,
                x: pos.x / scale,
                y: pos.y / scale,
                width: 200,
                height: 100,
                text: 'Nhập văn bản...',
                fontSize: 24,
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fill: '#000000',
                stroke: '#FFFFFF',
                strokeWidth: 2,
                isVertical: isVerticalText,
                rotation: 0,
                shadowColor: 'rgba(0,0,0,0.3)',
                shadowBlur: 3,
                shadowOffset: { x: 2, y: 2 },
            }

            setTextElements(prev => [...prev, newText])
            setSelectedId(newText.id)
            setCurrentTool('select')
        }

        // Add shape on click
        if (currentTool === 'rectangle' || currentTool === 'ellipse') {
            const pos = e.target.getStage()?.getPointerPosition()
            if (!pos) return

            const newShape: ShapeElement = {
                id: `shape-${Date.now()}`,
                type: currentTool,
                x: pos.x / scale,
                y: pos.y / scale,
                width: 100,
                height: 80,
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeWidth: 0,
                rotation: 0,
            }

            setShapes(prev => [...prev, newShape])
            setSelectedId(newShape.id)
            setCurrentTool('select')
        }
    }, [currentTool, scale, isVerticalText])

    // ===========================================
    // KEYBOARD SHORTCUTS
    // ===========================================
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            switch (e.key.toLowerCase()) {
                case 'v':
                    setCurrentTool('select')
                    break
                case 't':
                    setCurrentTool('text')
                    break
                case 'b':
                    setCurrentTool('brush')
                    break
                case 'e':
                    setCurrentTool('eraser')
                    break
                case 'r':
                    setCurrentTool('rectangle')
                    break
                case 'o':
                    setCurrentTool('ellipse')
                    break
                case 'delete':
                case 'backspace':
                    if (selectedId) {
                        setTextElements(prev => prev.filter(t => t.id !== selectedId))
                        setShapes(prev => prev.filter(s => s.id !== selectedId))
                        setSelectedId(null)
                    }
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedId])

    // ===========================================
    // SERIALIZE CANVAS DATA
    // ===========================================
    const getCanvasData = useCallback((): CanvasData => {
        return {
            version: '1.0',
            layers: {
                background: { visible: true },
                drawing: { visible: true, strokes: brushStrokes },
                shapes: { visible: true, items: shapes },
                text: { visible: true, items: textElements },
            },
            textElements,
            brushStrokes,
            shapes,
        }
    }, [textElements, brushStrokes, shapes])

    const handleSave = useCallback(() => {
        if (onSave) {
            onSave(getCanvasData())
        }
    }, [onSave, getCanvasData])

    // ===========================================
    // RENDER
    // ===========================================
    return (
        <div className="relative bg-gray-900 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-2 bg-gray-800/90 rounded-xl backdrop-blur-sm border border-gray-700">
                <ToolButton
                    icon="cursor"
                    active={currentTool === 'select'}
                    onClick={() => setCurrentTool('select')}
                    tooltip="Select/Move (V)"
                />
                <ToolButton
                    icon="type"
                    active={currentTool === 'text'}
                    onClick={() => setCurrentTool('text')}
                    tooltip="Text Tool (T)"
                />
                <ToolButton
                    icon="brush"
                    active={currentTool === 'brush'}
                    onClick={() => setCurrentTool('brush')}
                    tooltip="Brush/Pen (B)"
                />
                <ToolButton
                    icon="eraser"
                    active={currentTool === 'eraser'}
                    onClick={() => setCurrentTool('eraser')}
                    tooltip="Eraser (E)"
                />
                <div className="w-full h-px bg-gray-600" />
                <ToolButton
                    icon="square"
                    active={currentTool === 'rectangle'}
                    onClick={() => setCurrentTool('rectangle')}
                    tooltip="Rectangle (R)"
                />
                <ToolButton
                    icon="circle"
                    active={currentTool === 'ellipse'}
                    onClick={() => setCurrentTool('ellipse')}
                    tooltip="Ellipse (O)"
                />
            </div>

            {/* Properties Panel */}
            <div className="absolute top-4 right-4 z-10 w-64 p-4 bg-gray-800/90 rounded-xl backdrop-blur-sm border border-gray-700">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <SettingsIcon />
                    Properties
                </h3>

                {(currentTool === 'brush' || currentTool === 'eraser') && (
                    <>
                        <div className="mb-4">
                            <label className="text-gray-400 text-sm block mb-1">Brush Size: {brushSize}px</label>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>
                        {currentTool === 'brush' && (
                            <div className="mb-4">
                                <label className="text-gray-400 text-sm block mb-1">Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={brushColor}
                                        onChange={(e) => setBrushColor(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer border-2 border-gray-600"
                                    />
                                    <input
                                        type="text"
                                        value={brushColor}
                                        onChange={(e) => setBrushColor(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm border border-gray-600"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {currentTool === 'text' && (
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer hover:text-white transition-colors">
                            <input
                                type="checkbox"
                                checked={isVerticalText}
                                onChange={(e) => setIsVerticalText(e.target.checked)}
                                className="w-4 h-4 accent-purple-500"
                            />
                            <span>Vertical Text (縦書き)</span>
                        </label>
                    </div>
                )}

                {selectedId && (
                    <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                        <div className="text-gray-400 text-xs mb-1">Selected</div>
                        <div className="text-white text-sm font-mono truncate">{selectedId}</div>
                    </div>
                )}

                <button
                    onClick={handleSave}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
                >
                    💾 Save Canvas
                </button>

                {brushStrokes.length > 0 && (
                    <button
                        onClick={() => setBrushStrokes([])}
                        className="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                    >
                        Clear All Strokes
                    </button>
                )}
            </div>

            {/* Canvas Stage */}
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handleStageClick}
                style={{ cursor: getCursor(currentTool) }}
            >
                {/* Layer 1: Background Image */}
                <Layer>
                    {image && (
                        <KonvaImage
                            image={image}
                            width={stageSize.width}
                            height={stageSize.height}
                        />
                    )}
                </Layer>

                {/* Layer 2: Shapes (for covering text) */}
                <Layer>
                    {shapes.map((shape) => {
                        const scaledX = shape.x * scale
                        const scaledY = shape.y * scale
                        const scaledW = shape.width * scale
                        const scaledH = shape.height * scale

                        if (shape.type === 'rectangle') {
                            return (
                                <Rect
                                    key={shape.id}
                                    id={shape.id}
                                    x={scaledX}
                                    y={scaledY}
                                    width={scaledW}
                                    height={scaledH}
                                    fill={shape.fill}
                                    stroke={shape.stroke}
                                    strokeWidth={shape.strokeWidth}
                                    rotation={shape.rotation}
                                    draggable={currentTool === 'select'}
                                    onClick={() => setSelectedId(shape.id)}
                                    onDragEnd={(e) => {
                                        setShapes(prev =>
                                            prev.map(s =>
                                                s.id === shape.id
                                                    ? { ...s, x: e.target.x() / scale, y: e.target.y() / scale }
                                                    : s
                                            )
                                        )
                                    }}
                                    onTransformEnd={(e) => {
                                        const node = e.target
                                        setShapes(prev =>
                                            prev.map(s =>
                                                s.id === shape.id
                                                    ? {
                                                        ...s,
                                                        x: node.x() / scale,
                                                        y: node.y() / scale,
                                                        width: node.width() * node.scaleX() / scale,
                                                        height: node.height() * node.scaleY() / scale,
                                                        rotation: node.rotation(),
                                                    }
                                                    : s
                                            )
                                        )
                                        node.scaleX(1)
                                        node.scaleY(1)
                                    }}
                                />
                            )
                        } else {
                            return (
                                <Ellipse
                                    key={shape.id}
                                    id={shape.id}
                                    x={scaledX + scaledW / 2}
                                    y={scaledY + scaledH / 2}
                                    radiusX={scaledW / 2}
                                    radiusY={scaledH / 2}
                                    fill={shape.fill}
                                    stroke={shape.stroke}
                                    strokeWidth={shape.strokeWidth}
                                    rotation={shape.rotation}
                                    draggable={currentTool === 'select'}
                                    onClick={() => setSelectedId(shape.id)}
                                />
                            )
                        }
                    })}
                </Layer>

                {/* Layer 3: Drawing (Brush strokes) */}
                <Layer>
                    {brushStrokes.map((stroke) => (
                        <Line
                            key={stroke.id}
                            points={stroke.points.map(p => p * scale)}
                            stroke={stroke.stroke}
                            strokeWidth={stroke.strokeWidth * scale}
                            tension={stroke.tension}
                            lineCap={stroke.lineCap}
                            lineJoin={stroke.lineJoin}
                            globalCompositeOperation={stroke.globalCompositeOperation as GlobalCompositeOperation}
                        />
                    ))}
                    {currentStroke && (
                        <Line
                            points={currentStroke.points.map(p => p * scale)}
                            stroke={currentStroke.stroke}
                            strokeWidth={currentStroke.strokeWidth * scale}
                            tension={currentStroke.tension}
                            lineCap={currentStroke.lineCap}
                            lineJoin={currentStroke.lineJoin}
                        />
                    )}
                </Layer>

                {/* Layer 4: Text */}
                <Layer>
                    {textElements.map((textEl) => {
                        if (textEl.isVertical) {
                            return (
                                <VerticalText
                                    key={textEl.id}
                                    id={textEl.id}
                                    text={textEl.text}
                                    x={textEl.x * scale}
                                    y={textEl.y * scale}
                                    fontSize={textEl.fontSize * scale}
                                    fontFamily={textEl.fontFamily}
                                    fill={textEl.fill}
                                    stroke={textEl.stroke}
                                    strokeWidth={textEl.strokeWidth}
                                    shadowColor={textEl.shadowColor}
                                    shadowBlur={textEl.shadowBlur}
                                    draggable={currentTool === 'select'}
                                    onClick={() => setSelectedId(textEl.id)}
                                    onDragEnd={(e) => {
                                        setTextElements(prev =>
                                            prev.map(t =>
                                                t.id === textEl.id
                                                    ? { ...t, x: e.target.x() / scale, y: e.target.y() / scale }
                                                    : t
                                            )
                                        )
                                    }}
                                />
                            )
                        }

                        return (
                            <Text
                                key={textEl.id}
                                id={textEl.id}
                                x={textEl.x * scale}
                                y={textEl.y * scale}
                                width={textEl.width * scale}
                                text={textEl.text}
                                fontSize={textEl.fontSize * scale}
                                fontFamily={textEl.fontFamily}
                                fontStyle={textEl.fontStyle}
                                fill={textEl.fill}
                                stroke={textEl.stroke}
                                strokeWidth={textEl.strokeWidth}
                                shadowColor={textEl.shadowColor}
                                shadowBlur={textEl.shadowBlur}
                                shadowOffset={textEl.shadowOffset}
                                rotation={textEl.rotation}
                                draggable={currentTool === 'select'}
                                onClick={() => setSelectedId(textEl.id)}
                                onDblClick={() => {
                                    const newText = prompt('Edit text:', textEl.text)
                                    if (newText !== null) {
                                        setTextElements(prev =>
                                            prev.map(t =>
                                                t.id === textEl.id ? { ...t, text: newText } : t
                                            )
                                        )
                                    }
                                }}
                                onDragEnd={(e) => {
                                    setTextElements(prev =>
                                        prev.map(t =>
                                            t.id === textEl.id
                                                ? { ...t, x: e.target.x() / scale, y: e.target.y() / scale }
                                                : t
                                        )
                                    )
                                }}
                                onTransformEnd={(e) => {
                                    const node = e.target
                                    setTextElements(prev =>
                                        prev.map(t =>
                                            t.id === textEl.id
                                                ? {
                                                    ...t,
                                                    x: node.x() / scale,
                                                    y: node.y() / scale,
                                                    width: node.width() * node.scaleX() / scale,
                                                    rotation: node.rotation(),
                                                }
                                                : t
                                        )
                                    )
                                    node.scaleX(1)
                                    node.scaleY(1)
                                }}
                            />
                        )
                    })}
                </Layer>

                {/* Transformer for resizing */}
                <Layer>
                    <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            // Limit minimum size
                            if (newBox.width < 20 || newBox.height < 20) {
                                return oldBox
                            }
                            return newBox
                        }}
                        rotateEnabled={true}
                        enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
                    />
                </Layer>
            </Stage>

            {/* Status Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center px-4 py-2 bg-gray-800/80 rounded-lg backdrop-blur-sm text-sm">
                <div className="flex items-center gap-4 text-gray-400">
                    <span>Tool: <span className="text-white font-medium">{currentTool}</span></span>
                    <span>•</span>
                    <span>Size: <span className="text-white">{Math.round(stageSize.width)}×{Math.round(stageSize.height)}</span></span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <span>Texts: <span className="text-purple-400">{textElements.length}</span></span>
                    <span>Strokes: <span className="text-blue-400">{brushStrokes.length}</span></span>
                    <span>Shapes: <span className="text-green-400">{shapes.length}</span></span>
                </div>
            </div>
        </div>
    )
}

// ===========================================
// HELPER COMPONENTS
// ===========================================
interface ToolButtonProps {
    icon: string
    active: boolean
    onClick: () => void
    tooltip: string
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, active, onClick, tooltip }) => {
    const iconMap: Record<string, React.ReactNode> = {
        cursor: <CursorIcon />,
        type: <TypeIcon />,
        brush: <BrushIcon />,
        eraser: <EraserIcon />,
        square: <SquareIcon />,
        circle: <CircleIcon />,
    }

    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={`
        w-10 h-10 flex items-center justify-center rounded-lg transition-all
        ${active
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                }
      `}
        >
            {iconMap[icon] || icon}
        </button>
    )
}

// SVG Icons
const CursorIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    </svg>
)

const TypeIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
)

const BrushIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
        <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
    </svg>
)

const EraserIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
        <path d="M22 21H7" />
        <path d="m5 11 9 9" />
    </svg>
)

const SquareIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
)

const CircleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
    </svg>
)

const SettingsIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

function getCursor(tool: EditorTool): string {
    switch (tool) {
        case 'brush':
        case 'eraser':
            return 'crosshair'
        case 'text':
            return 'text'
        case 'rectangle':
        case 'ellipse':
            return 'crosshair'
        default:
            return 'default'
    }
}

export default MangaEditor
