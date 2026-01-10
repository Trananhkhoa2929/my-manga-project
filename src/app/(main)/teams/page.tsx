'use client'

// ===========================================
// TEAMS/GROUPS PAGE
// View and manage scanlation teams
// ===========================================

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Users,
    Plus,
    Settings,
    Crown,
    Edit3,
    UserPlus,
    ExternalLink,
    Search,
    Shield,
    BookOpen
} from 'lucide-react'

interface User {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    role: string
}

interface GroupMember {
    id: string
    group_id: string
    user_id: string
    role: 'owner' | 'admin' | 'translator' | 'editor' | 'proofreader' | 'member'
    joined_at: string
    user?: User
}

interface Group {
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
    members?: GroupMember[]
}

const roleConfig = {
    owner: { label: 'Owner', color: 'text-yellow-400 bg-yellow-500/20', icon: Crown },
    admin: { label: 'Admin', color: 'text-red-400 bg-red-500/20', icon: Shield },
    translator: { label: 'Translator', color: 'text-blue-400 bg-blue-500/20', icon: Edit3 },
    editor: { label: 'Editor', color: 'text-purple-400 bg-purple-500/20', icon: Edit3 },
    proofreader: { label: 'Proofreader', color: 'text-green-400 bg-green-500/20', icon: Edit3 },
    member: { label: 'Member', color: 'text-gray-400 bg-gray-500/20', icon: Users },
}

export default function TeamsPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await fetch('/api/editor/groups?include_members=true')
                const data = await response.json()
                setGroups(data.groups || [])
            } catch (error) {
                console.error('Failed to fetch groups:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchGroups()
    }, [])

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Đang tải nhóm...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users className="w-6 h-6 text-purple-400" />
                            Scanlation Teams
                        </h1>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" />
                        Tạo nhóm mới
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Users className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{groups.length}</div>
                                <div className="text-sm text-gray-400">Nhóm</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <UserPlus className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {groups.reduce((sum, g) => sum + g.members_count, 0)}
                                </div>
                                <div className="text-sm text-gray-400">Thành viên</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <BookOpen className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {groups.reduce((sum, g) => sum + g.projects_count, 0)}
                                </div>
                                <div className="text-sm text-gray-400">Dự án</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <UserPlus className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {groups.filter(g => g.is_recruiting).length}
                                </div>
                                <div className="text-sm text-gray-400">Đang tuyển</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Tìm nhóm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                </div>

                {/* Groups List */}
                {filteredGroups.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy nhóm nào</h3>
                        <p className="text-gray-400 mb-6">Hãy tạo nhóm dịch thuật đầu tiên của bạn</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredGroups.map((group) => (
                            <div
                                key={group.id}
                                className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
                            >
                                {/* Banner */}
                                {group.banner_url && (
                                    <div className="h-32 bg-gradient-to-r from-purple-600/30 to-pink-600/30 relative">
                                        <img
                                            src={group.banner_url}
                                            alt={group.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Logo */}
                                        <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center text-2xl font-bold text-white -mt-10 border-4 border-gray-900 relative z-10">
                                            {group.logo_url ? (
                                                <img
                                                    src={group.logo_url}
                                                    alt={group.name}
                                                    className="w-full h-full rounded-lg object-cover"
                                                />
                                            ) : (
                                                group.name.charAt(0).toUpperCase()
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-white">{group.name}</h3>
                                                {group.is_recruiting && (
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                                        Đang tuyển
                                                    </span>
                                                )}
                                                {!group.is_public && (
                                                    <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
                                                        Riêng tư
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-sm mb-3">
                                                {group.description || 'Chưa có mô tả'}
                                            </p>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {group.members_count} thành viên
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="w-4 h-4" />
                                                    {group.projects_count} dự án
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                                <Settings className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                                <ExternalLink className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Members Preview */}
                                    {group.members && group.members.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-700">
                                            <h4 className="text-sm font-medium text-gray-400 mb-3">Thành viên</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {group.members.map((member) => {
                                                    const config = roleConfig[member.role]
                                                    return (
                                                        <div
                                                            key={member.id}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-lg"
                                                        >
                                                            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                                                                {member.user?.display_name?.charAt(0) || member.user?.username?.charAt(0) || '?'}
                                                            </div>
                                                            <span className="text-white text-sm">
                                                                {member.user?.display_name || member.user?.username || 'Unknown'}
                                                            </span>
                                                            <span className={`px-1.5 py-0.5 rounded text-xs ${config.color}`}>
                                                                {config.label}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
