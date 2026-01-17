// ===========================================
// PAGES API ROUTE - [pageId]
// GET: Load page data
// PUT: Update page data
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_CANVAS_DATA } from '@/lib/types/editor.types'
import type { PageData } from '@/lib/types/editor.types'

// In-memory storage for demo (replace with Supabase in production)
const pagesStore = new Map<string, PageData>()

// Helper to generate demo page
function createDemoPage(pageId: string): PageData {
    return {
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ pageId: string }> }
) {
    try {
        const { pageId } = await params

        // Get or create page
        let page = pagesStore.get(pageId)
        if (!page) {
            page = createDemoPage(pageId)
            pagesStore.set(pageId, page)
        }

        return NextResponse.json({
            success: true,
            page,
        })
    } catch (error) {
        console.error('[Pages API] GET error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to load page' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ pageId: string }> }
) {
    try {
        const { pageId } = await params
        const body = await request.json()

        // Get existing page or create new
        let page = pagesStore.get(pageId)
        if (!page) {
            page = createDemoPage(pageId)
        }

        // Update page data
        const updatedPage: PageData = {
            ...page,
            ...body,
            updated_at: new Date().toISOString(),
        }

        pagesStore.set(pageId, updatedPage)

        return NextResponse.json({
            success: true,
            page,
            message: 'Page updated successfully',
        })
    } catch (error) {
        console.error('[Pages API] PUT error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update page' },
            { status: 500 }
        )
    }
}
