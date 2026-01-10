// ===========================================
// CANVAS SAVE API ROUTE
// PUT: Save canvas data for a page
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_CANVAS_DATA } from '@/lib/types/editor.types'
import type { PageData, CanvasData } from '@/lib/types/editor.types'

// In-memory storage for demo (replace with Supabase in production)
const pagesStore = new Map<string, PageData>()

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ pageId: string }> }
) {
    try {
        const { pageId } = await params
        const body = await request.json()
        const { canvas_data } = body as { canvas_data: CanvasData }

        if (!canvas_data) {
            return NextResponse.json(
                { success: false, error: 'canvas_data is required' },
                { status: 400 }
            )
        }

        // Get existing page or create new
        let page = pagesStore.get(pageId)
        if (!page) {
            page = {
                id: pageId,
                chapter_id: 'demo-chapter',
                page_number: 1,
                original_url: '/demo/page1.jpg',
                clean_url: null,
                final_url: null,
                canvas_data: DEFAULT_CANVAS_DATA,
                ocr_data: null,
                status: 'raw',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        }

        // Update canvas data and status
        page = {
            ...page,
            canvas_data,
            status: 'edited',
            updated_at: new Date().toISOString(),
        }

        pagesStore.set(pageId, page)

        console.log(`[Canvas API] Saved canvas for page ${pageId}:`, {
            textElements: canvas_data.textElements?.length || 0,
            brushStrokes: canvas_data.brushStrokes?.length || 0,
            shapes: canvas_data.shapes?.length || 0,
        })

        return NextResponse.json({
            success: true,
            page,
            message: 'Canvas saved successfully',
        })
    } catch (error) {
        console.error('[Canvas API] PUT error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to save canvas' },
            { status: 500 }
        )
    }
}

// GET: Load canvas data for a page
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ pageId: string }> }
) {
    try {
        const { pageId } = await params

        const page = pagesStore.get(pageId)

        if (!page) {
            return NextResponse.json({
                success: true,
                canvas_data: DEFAULT_CANVAS_DATA,
                message: 'Using default canvas data',
            })
        }

        return NextResponse.json({
            success: true,
            canvas_data: page.canvas_data,
        })
    } catch (error) {
        console.error('[Canvas API] GET error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to load canvas' },
            { status: 500 }
        )
    }
}
