// ===========================================
// CHAPTERS API ROUTE
// GET: List chapters for a project
// POST: Create new chapter
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import type { Chapter } from '@/lib/types/editor.types'

// In-memory storage for demo
const chaptersStore = new Map<string, Chapter>()

// Initialize with demo chapters
const demoChapters: Chapter[] = [
    {
        id: 'demo-chapter-1',
        project_id: 'demo-project',
        series_id: 'demo-series',
        number: 1,
        volume: 1,
        title: 'Chapter 1: The Beginning',
        slug: 'chapter-1',
        status: 'published',
        translator_id: 'demo-user',
        editor_id: 'demo-user',
        pages_count: 24,
        views_count: 1234,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
        id: 'demo-chapter-2',
        project_id: 'demo-project',
        series_id: 'demo-series',
        number: 2,
        volume: 1,
        title: 'Chapter 2: New Friends',
        slug: 'chapter-2',
        status: 'editing',
        translator_id: 'demo-user',
        editor_id: null,
        pages_count: 22,
        views_count: 0,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        published_at: null,
    },
    {
        id: 'demo-chapter-3',
        project_id: 'demo-project',
        series_id: 'demo-series',
        number: 3,
        volume: 1,
        title: 'Chapter 3: The Journey',
        slug: 'chapter-3',
        status: 'draft',
        translator_id: null,
        editor_id: null,
        pages_count: 0,
        views_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: null,
    },
]

demoChapters.forEach(ch => chaptersStore.set(ch.id, ch))

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('project_id')

        let chapters = Array.from(chaptersStore.values())

        if (projectId) {
            chapters = chapters.filter(ch => ch.project_id === projectId)
        }

        // Sort by chapter number
        chapters.sort((a, b) => a.number - b.number)

        return NextResponse.json({
            success: true,
            chapters,
            total: chapters.length,
        })
    } catch (error) {
        console.error('[Chapters API] GET error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to load chapters' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const slug = `chapter-${body.number}`.toLowerCase().replace(/\s+/g, '-')

        const newChapter: Chapter = {
            id: `chapter-${Date.now()}`,
            project_id: body.project_id,
            series_id: body.series_id || 'demo-series',
            number: body.number,
            volume: body.volume || null,
            title: body.title || null,
            slug,
            status: 'draft',
            translator_id: body.translator_id || null,
            editor_id: null,
            pages_count: 0,
            views_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            published_at: null,
        }

        chaptersStore.set(newChapter.id, newChapter)

        return NextResponse.json({
            success: true,
            chapter: newChapter,
            message: 'Chapter created successfully',
        })
    } catch (error) {
        console.error('[Chapters API] POST error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create chapter' },
            { status: 500 }
        )
    }
}
