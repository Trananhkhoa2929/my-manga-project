// ===========================================
// EDITOR API - Types & Interfaces
// ===========================================

import type { CanvasData, TextElement, BrushStroke, ShapeElement } from '@/components/features/editor/MangaEditor'

// Page data from database
export interface PageData {
    id: string
    chapter_id: string
    page_number: number
    original_url: string
    clean_url: string | null
    final_url: string | null
    canvas_data: CanvasData
    ocr_data: OCRData | null
    status: 'raw' | 'cleaned' | 'translated' | 'edited' | 'final'
    created_at: string
    updated_at: string
}

export interface OCRData {
    regions: OCRRegion[]
    processed_at: string
}

export interface OCRRegion {
    id: string
    text: string
    confidence: number
    bounding_box: {
        x: number
        y: number
        width: number
        height: number
    }
}

// API Request/Response types
export interface SaveCanvasRequest {
    canvas_data: CanvasData
}

export interface SaveCanvasResponse {
    success: boolean
    page: PageData
    message?: string
}

export interface LoadPageResponse {
    success: boolean
    page: PageData
}

export interface RenderPageRequest {
    format: 'png' | 'jpeg' | 'webp'
    quality?: number
}

export interface RenderPageResponse {
    success: boolean
    image_url: string
}

// Project types
export interface Project {
    id: string
    series_id: string
    group_id: string | null
    uploader_id: string
    translator_id: string | null
    status: 'draft' | 'in_progress' | 'review' | 'published' | 'archived'
    target_language: string
    chapters_total: number
    chapters_completed: number
    is_public: boolean
    allow_collaborators: boolean
    created_at: string
    updated_at: string
    published_at: string | null
}

export interface Chapter {
    id: string
    project_id: string
    series_id: string
    number: number
    volume: number | null
    title: string | null
    slug: string
    status: 'draft' | 'translating' | 'editing' | 'proofreading' | 'published'
    translator_id: string | null
    editor_id: string | null
    pages_count: number
    views_count: number
    created_at: string
    updated_at: string
    published_at: string | null
}

// User & Group types
export interface User {
    id: string
    email: string
    username: string
    display_name: string | null
    avatar_url: string | null
    role: 'reader' | 'translator' | 'uploader' | 'admin'
    bio: string | null
    translations_count: number
    uploads_count: number
    reputation_score: number
    created_at: string
    last_active_at: string
}

export interface Group {
    id: string
    name: string
    slug: string
    description: string | null
    logo_url: string | null
    banner_url: string | null
    is_public: boolean
    is_recruiting: boolean
    members_count: number
    projects_count: number
    owner_id: string
    created_at: string
}

export interface GroupMember {
    id: string
    group_id: string
    user_id: string
    role: 'owner' | 'admin' | 'translator' | 'editor' | 'proofreader' | 'member'
    joined_at: string
    user?: User
}

// Credit types
export interface Credit {
    id: string
    chapter_id: string
    user_id: string | null
    group_id: string | null
    role: 'translator' | 'editor' | 'proofreader' | 'cleaner' | 'typesetter' | 'quality_check' | 'raw_provider'
    note: string | null
    user?: User
    group?: Group
}

// Re-export canvas types
export type { CanvasData, TextElement, BrushStroke, ShapeElement }

// Default canvas data
export const DEFAULT_CANVAS_DATA: CanvasData = {
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
