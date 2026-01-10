// ===========================================
// PROJECTS API ROUTE
// GET: List all projects
// POST: Create new project
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import type { Project } from '@/lib/types/editor.types'

// In-memory storage for demo
const projectsStore = new Map<string, Project>()

// Initialize with demo project
const demoProject: Project = {
    id: 'demo-project',
    series_id: 'demo-series',
    group_id: 'demo-group',
    uploader_id: 'demo-user',
    translator_id: 'demo-user',
    status: 'in_progress',
    target_language: 'vie',
    chapters_total: 3,
    chapters_completed: 1,
    is_public: true,
    allow_collaborators: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: null,
}
projectsStore.set(demoProject.id, demoProject)

export async function GET() {
    try {
        const projects = Array.from(projectsStore.values())

        return NextResponse.json({
            success: true,
            projects,
            total: projects.length,
        })
    } catch (error) {
        console.error('[Projects API] GET error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to load projects' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const newProject: Project = {
            id: `project-${Date.now()}`,
            series_id: body.series_id,
            group_id: body.group_id || null,
            uploader_id: body.uploader_id || 'current-user',
            translator_id: body.translator_id || null,
            status: 'draft',
            target_language: body.target_language || 'vie',
            chapters_total: 0,
            chapters_completed: 0,
            is_public: body.is_public ?? false,
            allow_collaborators: body.allow_collaborators ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            published_at: null,
        }

        projectsStore.set(newProject.id, newProject)

        return NextResponse.json({
            success: true,
            project: newProject,
            message: 'Project created successfully',
        })
    } catch (error) {
        console.error('[Projects API] POST error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create project' },
            { status: 500 }
        )
    }
}
