// ===========================================
// EDITOR API CLIENT
// Frontend API calls for canvas persistence
// ===========================================

import type {
    PageData,
    CanvasData,
    SaveCanvasResponse,
    LoadPageResponse,
    Chapter,
    Project,
    DEFAULT_CANVAS_DATA
} from '@/lib/types/editor.types'

const API_BASE = '/api/editor'

/**
 * Editor API client for canvas data persistence
 */
export const editorApi = {
    // ===========================================
    // PAGE OPERATIONS
    // ===========================================

    /**
     * Load a page with its canvas data
     */
    async loadPage(pageId: string): Promise<PageData> {
        const response = await fetch(`${API_BASE}/pages/${pageId}`)

        if (!response.ok) {
            throw new Error(`Failed to load page: ${response.statusText}`)
        }

        const data: LoadPageResponse = await response.json()
        return data.page
    },

    /**
     * Save canvas data for a page
     */
    async saveCanvas(pageId: string, canvasData: CanvasData): Promise<SaveCanvasResponse> {
        const response = await fetch(`${API_BASE}/pages/${pageId}/canvas`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ canvas_data: canvasData }),
        })

        if (!response.ok) {
            throw new Error(`Failed to save canvas: ${response.statusText}`)
        }

        return response.json()
    },

    /**
     * Get all pages for a chapter
     */
    async getChapterPages(chapterId: string): Promise<PageData[]> {
        const response = await fetch(`${API_BASE}/chapters/${chapterId}/pages`)

        if (!response.ok) {
            throw new Error(`Failed to load chapter pages: ${response.statusText}`)
        }

        const data = await response.json()
        return data.pages
    },

    /**
     * Update page status
     */
    async updatePageStatus(pageId: string, status: PageData['status']): Promise<PageData> {
        const response = await fetch(`${API_BASE}/pages/${pageId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        })

        if (!response.ok) {
            throw new Error(`Failed to update page status: ${response.statusText}`)
        }

        const data = await response.json()
        return data.page
    },

    /**
     * Render page to image (server-side)
     */
    async renderPage(pageId: string, format: 'png' | 'jpeg' | 'webp' = 'png'): Promise<Blob> {
        const response = await fetch(`${API_BASE}/pages/${pageId}/render`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ format }),
        })

        if (!response.ok) {
            throw new Error(`Failed to render page: ${response.statusText}`)
        }

        return response.blob()
    },

    // ===========================================
    // CHAPTER OPERATIONS
    // ===========================================

    /**
     * Get chapter details
     */
    async getChapter(chapterId: string): Promise<Chapter> {
        const response = await fetch(`${API_BASE}/chapters/${chapterId}`)

        if (!response.ok) {
            throw new Error(`Failed to load chapter: ${response.statusText}`)
        }

        const data = await response.json()
        return data.chapter
    },

    /**
     * Update chapter status
     */
    async updateChapterStatus(chapterId: string, status: Chapter['status']): Promise<Chapter> {
        const response = await fetch(`${API_BASE}/chapters/${chapterId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        })

        if (!response.ok) {
            throw new Error(`Failed to update chapter status: ${response.statusText}`)
        }

        const data = await response.json()
        return data.chapter
    },

    // ===========================================
    // PROJECT OPERATIONS
    // ===========================================

    /**
     * Get project details
     */
    async getProject(projectId: string): Promise<Project> {
        const response = await fetch(`${API_BASE}/projects/${projectId}`)

        if (!response.ok) {
            throw new Error(`Failed to load project: ${response.statusText}`)
        }

        const data = await response.json()
        return data.project
    },

    /**
     * Get all chapters for a project
     */
    async getProjectChapters(projectId: string): Promise<Chapter[]> {
        const response = await fetch(`${API_BASE}/projects/${projectId}/chapters`)

        if (!response.ok) {
            throw new Error(`Failed to load project chapters: ${response.statusText}`)
        }

        const data = await response.json()
        return data.chapters
    },

    /**
     * Create a new chapter in a project
     */
    async createChapter(projectId: string, chapterData: {
        number: number
        title?: string
        volume?: number
    }): Promise<Chapter> {
        const response = await fetch(`${API_BASE}/projects/${projectId}/chapters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chapterData),
        })

        if (!response.ok) {
            throw new Error(`Failed to create chapter: ${response.statusText}`)
        }

        const data = await response.json()
        return data.chapter
    },

    /**
     * Upload pages to a chapter
     */
    async uploadPages(chapterId: string, files: File[]): Promise<PageData[]> {
        const formData = new FormData()
        files.forEach((file, index) => {
            formData.append(`page_${index}`, file)
        })

        const response = await fetch(`${API_BASE}/chapters/${chapterId}/pages/upload`, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            throw new Error(`Failed to upload pages: ${response.statusText}`)
        }

        const data = await response.json()
        return data.pages
    },

    // ===========================================
    // UTILITY FUNCTIONS
    // ===========================================

    /**
     * Export canvas data as JSON file
     */
    exportCanvasAsJSON(canvasData: CanvasData, filename: string = 'canvas_data.json') {
        const blob = new Blob([JSON.stringify(canvasData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    },

    /**
     * Import canvas data from JSON file
     */
    async importCanvasFromJSON(file: File): Promise<CanvasData> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string)
                    if (data.version && data.textElements && data.brushStrokes) {
                        resolve(data as CanvasData)
                    } else {
                        reject(new Error('Invalid canvas data format'))
                    }
                } catch (err) {
                    reject(new Error('Failed to parse JSON file'))
                }
            }
            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsText(file)
        })
    },
}

export default editorApi
