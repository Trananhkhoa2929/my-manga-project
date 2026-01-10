// ===========================================
// GROUPS API ROUTE
// GET: List all groups (scanlation teams)
// POST: Create new group
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import type { Group, GroupMember, User } from '@/lib/types/editor.types'

// In-memory storage for demo
const groupsStore = new Map<string, Group>()
const membersStore = new Map<string, GroupMember[]>()

// Demo users
const demoUsers: User[] = [
    {
        id: 'user-1',
        email: 'admin@mangahub.com',
        username: 'admin_trans',
        display_name: 'Admin Translator',
        avatar_url: '/avatars/admin.jpg',
        role: 'admin',
        bio: 'Lead translator for MangaHub',
        translations_count: 156,
        uploads_count: 45,
        reputation_score: 9800,
        created_at: new Date(Date.now() - 86400000 * 365).toISOString(),
        last_active_at: new Date().toISOString(),
    },
    {
        id: 'user-2',
        email: 'translator1@mangahub.com',
        username: 'jp_master',
        display_name: 'JP Master',
        avatar_url: '/avatars/user2.jpg',
        role: 'translator',
        bio: 'Japanese to Vietnamese translator',
        translations_count: 89,
        uploads_count: 12,
        reputation_score: 5400,
        created_at: new Date(Date.now() - 86400000 * 200).toISOString(),
        last_active_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'user-3',
        email: 'editor1@mangahub.com',
        username: 'clean_master',
        display_name: 'Clean Master',
        avatar_url: '/avatars/user3.jpg',
        role: 'translator',
        bio: 'Expert in cleaning and typesetting',
        translations_count: 23,
        uploads_count: 67,
        reputation_score: 4200,
        created_at: new Date(Date.now() - 86400000 * 150).toISOString(),
        last_active_at: new Date(Date.now() - 7200000).toISOString(),
    },
]

// Initialize demo groups
const demoGroups: Group[] = [
    {
        id: 'group-1',
        name: 'MangaHub Official',
        slug: 'mangahub-official',
        description: 'Official scanlation team of MangaHub. We translate quality manga from Japanese and Korean.',
        logo_url: '/groups/mangahub.png',
        banner_url: '/groups/mangahub-banner.jpg',
        is_public: true,
        is_recruiting: true,
        members_count: 15,
        projects_count: 8,
        owner_id: 'user-1',
        created_at: new Date(Date.now() - 86400000 * 365).toISOString(),
    },
    {
        id: 'group-2',
        name: 'Quick Scans',
        slug: 'quick-scans',
        description: 'Fast translations for popular series. Quality and speed combined!',
        logo_url: '/groups/quickscans.png',
        banner_url: null,
        is_public: true,
        is_recruiting: false,
        members_count: 7,
        projects_count: 12,
        owner_id: 'user-2',
        created_at: new Date(Date.now() - 86400000 * 200).toISOString(),
    },
]

demoGroups.forEach(g => groupsStore.set(g.id, g))

// Initialize demo members
membersStore.set('group-1', [
    { id: 'm1', group_id: 'group-1', user_id: 'user-1', role: 'owner', joined_at: new Date(Date.now() - 86400000 * 365).toISOString(), user: demoUsers[0] },
    { id: 'm2', group_id: 'group-1', user_id: 'user-2', role: 'translator', joined_at: new Date(Date.now() - 86400000 * 300).toISOString(), user: demoUsers[1] },
    { id: 'm3', group_id: 'group-1', user_id: 'user-3', role: 'editor', joined_at: new Date(Date.now() - 86400000 * 250).toISOString(), user: demoUsers[2] },
])

membersStore.set('group-2', [
    { id: 'm4', group_id: 'group-2', user_id: 'user-2', role: 'owner', joined_at: new Date(Date.now() - 86400000 * 200).toISOString(), user: demoUsers[1] },
])

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const includeMembers = searchParams.get('include_members') === 'true'

        const groups = Array.from(groupsStore.values()).map(group => {
            if (includeMembers) {
                return {
                    ...group,
                    members: membersStore.get(group.id) || [],
                }
            }
            return group
        })

        return NextResponse.json({
            success: true,
            groups,
            total: groups.length,
        })
    } catch (error) {
        console.error('[Groups API] GET error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to load groups' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

        const newGroup: Group = {
            id: `group-${Date.now()}`,
            name: body.name,
            slug,
            description: body.description || null,
            logo_url: body.logo_url || null,
            banner_url: body.banner_url || null,
            is_public: body.is_public ?? true,
            is_recruiting: body.is_recruiting ?? false,
            members_count: 1,
            projects_count: 0,
            owner_id: body.owner_id || 'current-user',
            created_at: new Date().toISOString(),
        }

        groupsStore.set(newGroup.id, newGroup)

        // Add owner as first member
        membersStore.set(newGroup.id, [{
            id: `member-${Date.now()}`,
            group_id: newGroup.id,
            user_id: newGroup.owner_id,
            role: 'owner',
            joined_at: new Date().toISOString(),
        }])

        return NextResponse.json({
            success: true,
            group: newGroup,
            message: 'Group created successfully',
        })
    } catch (error) {
        console.error('[Groups API] POST error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create group' },
            { status: 500 }
        )
    }
}
