// ===========================================
// EDITOR STORE - Zustand State Management
// For MangaEditor component
// ===========================================

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { TextElement, BrushStroke, ShapeElement, CanvasData, EditorTool } from '@/components/features/editor/MangaEditor'

interface EditorState {
    // Current page
    currentPageId: string | null
    imageUrl: string | null

    // Canvas data
    canvasData: CanvasData | null
    textElements: TextElement[]
    brushStrokes: BrushStroke[]
    shapes: ShapeElement[]

    // Tool state
    currentTool: EditorTool
    selectedId: string | null

    // Brush settings
    brushColor: string
    brushSize: number

    // Text settings
    isVerticalText: boolean
    fontSize: number
    fontFamily: string
    textColor: string
    strokeColor: string
    strokeWidth: number

    // History for undo/redo
    history: CanvasData[]
    historyIndex: number

    // Actions
    loadPage: (pageId: string, imageUrl: string, canvasData?: CanvasData) => void
    setTool: (tool: EditorTool) => void
    setSelectedId: (id: string | null) => void

    addTextElement: (element: TextElement) => void
    updateTextElement: (id: string, updates: Partial<TextElement>) => void
    removeTextElement: (id: string) => void

    addBrushStroke: (stroke: BrushStroke) => void
    clearBrushStrokes: () => void

    addShape: (shape: ShapeElement) => void
    updateShape: (id: string, updates: Partial<ShapeElement>) => void
    removeShape: (id: string) => void

    getCanvasData: () => CanvasData
    saveToHistory: () => void
    undo: () => void
    redo: () => void
    reset: () => void

    // Settings
    setBrushColor: (color: string) => void
    setBrushSize: (size: number) => void
    setIsVerticalText: (isVertical: boolean) => void
    setFontSize: (size: number) => void
    setFontFamily: (family: string) => void
}

const initialCanvasData: CanvasData = {
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
}

export const useEditorStore = create<EditorState>()(
    devtools(
        (set, get) => ({
            // Initial state
            currentPageId: null,
            imageUrl: null,
            canvasData: null,
            textElements: [],
            brushStrokes: [],
            shapes: [],
            currentTool: 'select',
            selectedId: null,
            brushColor: '#FFFFFF',
            brushSize: 20,
            isVerticalText: false,
            fontSize: 24,
            fontFamily: 'Arial',
            textColor: '#000000',
            strokeColor: '#FFFFFF',
            strokeWidth: 2,
            history: [],
            historyIndex: -1,

            loadPage: (pageId, imageUrl, canvasData) => {
                const data = canvasData || initialCanvasData
                set({
                    currentPageId: pageId,
                    imageUrl,
                    canvasData: data,
                    textElements: data.textElements || [],
                    brushStrokes: data.brushStrokes || [],
                    shapes: data.shapes || [],
                    selectedId: null,
                    history: [data],
                    historyIndex: 0,
                })
            },

            setTool: (tool) => set({ currentTool: tool, selectedId: null }),
            setSelectedId: (id) => set({ selectedId: id }),

            addTextElement: (element) => {
                set((state) => ({
                    textElements: [...state.textElements, element],
                }))
                get().saveToHistory()
            },

            updateTextElement: (id, updates) => {
                set((state) => ({
                    textElements: state.textElements.map((el) =>
                        el.id === id ? { ...el, ...updates } : el
                    ),
                }))
            },

            removeTextElement: (id) => {
                set((state) => ({
                    textElements: state.textElements.filter((el) => el.id !== id),
                    selectedId: state.selectedId === id ? null : state.selectedId,
                }))
                get().saveToHistory()
            },

            addBrushStroke: (stroke) => {
                set((state) => ({
                    brushStrokes: [...state.brushStrokes, stroke],
                }))
            },

            clearBrushStrokes: () => {
                set({ brushStrokes: [] })
                get().saveToHistory()
            },

            addShape: (shape) => {
                set((state) => ({
                    shapes: [...state.shapes, shape],
                }))
                get().saveToHistory()
            },

            updateShape: (id, updates) => {
                set((state) => ({
                    shapes: state.shapes.map((s) =>
                        s.id === id ? { ...s, ...updates } : s
                    ),
                }))
            },

            removeShape: (id) => {
                set((state) => ({
                    shapes: state.shapes.filter((s) => s.id !== id),
                    selectedId: state.selectedId === id ? null : state.selectedId,
                }))
                get().saveToHistory()
            },

            getCanvasData: () => {
                const state = get()
                return {
                    version: '1.0',
                    layers: {
                        background: { visible: true },
                        drawing: { visible: true, strokes: state.brushStrokes },
                        shapes: { visible: true, items: state.shapes },
                        text: { visible: true, items: state.textElements },
                    },
                    textElements: state.textElements,
                    brushStrokes: state.brushStrokes,
                    shapes: state.shapes,
                }
            },

            saveToHistory: () => {
                const state = get()
                const newHistory = state.history.slice(0, state.historyIndex + 1)
                newHistory.push(state.getCanvasData())
                set({
                    history: newHistory.slice(-50), // Keep last 50 states
                    historyIndex: Math.min(newHistory.length - 1, 49),
                })
            },

            undo: () => {
                const state = get()
                if (state.historyIndex > 0) {
                    const prevIndex = state.historyIndex - 1
                    const prevData = state.history[prevIndex]
                    set({
                        historyIndex: prevIndex,
                        textElements: prevData.textElements,
                        brushStrokes: prevData.brushStrokes,
                        shapes: prevData.shapes,
                    })
                }
            },

            redo: () => {
                const state = get()
                if (state.historyIndex < state.history.length - 1) {
                    const nextIndex = state.historyIndex + 1
                    const nextData = state.history[nextIndex]
                    set({
                        historyIndex: nextIndex,
                        textElements: nextData.textElements,
                        brushStrokes: nextData.brushStrokes,
                        shapes: nextData.shapes,
                    })
                }
            },

            reset: () => {
                set({
                    currentPageId: null,
                    imageUrl: null,
                    canvasData: null,
                    textElements: [],
                    brushStrokes: [],
                    shapes: [],
                    currentTool: 'select',
                    selectedId: null,
                    history: [],
                    historyIndex: -1,
                })
            },

            // Settings
            setBrushColor: (color) => set({ brushColor: color }),
            setBrushSize: (size) => set({ brushSize: size }),
            setIsVerticalText: (isVertical) => set({ isVerticalText: isVertical }),
            setFontSize: (size) => set({ fontSize: size }),
            setFontFamily: (family) => set({ fontFamily: family }),
        }),
        { name: 'editor-store' }
    )
)

export default useEditorStore
