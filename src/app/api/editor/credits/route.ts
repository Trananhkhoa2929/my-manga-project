// ===========================================
// CREDITS API ROUTE
// GET: Get credits for a chapter
// POST: Add credit to chapter
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import type { Credit, User, Group } from '@/lib/types/editor.types'

// In-memory storage for demo
const creditsStore = new Map<string, Credit[]>()

// Demo credits
const demoCredits: Credit[] = [
    {
        id: 'credit-1',
        chapter_id: 'demo-chapter-1',
        user_id: 'user-1',
        group_id: 'group-1',
        role: 'translator',
        note: 'Japanese to Vietnamese translation',
    },
    {
        id: 'credit-2',
        chapter_id: 'demo-chapter-1',
        user_id: 'user-3',
        group_id: 'group-1',
        role: 'editor',
        note: 'Cleaning and typesetting',
    },
    {
        id: 'credit-3',
        chapter_id: 'demo-chapter-1',
        user_id: 'user-2',
        group_id: 'group-1',
        role: 'proofreader',
        note: null,
    },
]

creditsStore.set('demo-chapter-1', demoCredits)

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const chapterId = searchParams.get('chapter_id')

        if (!chapterId) {
            return NextResponse.json(
                { success: false, error: 'chapter_id is required' },
                { status: 400 }
            )
        }

        const credits = creditsStore.get(chapterId) || []

        return NextResponse.json({
            success: true,
            credits,
            total: credits.length,
        })
    } catch (error) {
        console.error('[Credits API] GET error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to load credits' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { chapter_id, user_id, group_id, role, note } = body

        if (!chapter_id || !role) {
            return NextResponse.json(
                { success: false, error: 'chapter_id and role are required' },
                { status: 400 }
            )
        }

        const newCredit: Credit = {
            id: `credit-${Date.now()}`,
            chapter_id,
            user_id: user_id || null,
            group_id: group_id || null,
            role,
            note: note || null,
        }

        const existing = creditsStore.get(chapter_id) || []
        creditsStore.set(chapter_id, [...existing, newCredit])

        return NextResponse.json({
            success: true,
            credit: newCredit,
            message: 'Credit added successfully',
        })
    } catch (error) {
        console.error('[Credits API] POST error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to add credit' },
            { status: 500 }
        )
    }
}
