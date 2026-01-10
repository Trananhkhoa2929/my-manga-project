'use client'

// ===========================================
// PROJECTS DASHBOARD PAGE
// View all translation projects
// ===========================================

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    FolderOpen,
    Plus,
    Users,
    BookOpen,
    Clock,
    CheckCircle,
    Edit3,
    Eye,
    ArrowRight,
    Search,
    Filter,
    LayoutGrid,
    List,
    Sparkles
} from 'lucide-react'

interface Project {
    id: string
    series_id: string
    group_id: string | null
    status: 'draft' | 'in_progress' | 'review' | 'published' | 'archived'
    target_language: string
    chapters_total: number
    chapters_completed: number
    is_public: boolean
    created_at: string
    updated_at: string
}

interface Chapter {
    id: string
    project_id: string
    number: number
    title: string | null
    status: 'draft' | 'translating' | 'editing' | 'proofreading' | 'published'
    pages_count: number
    views_count: number
}

const statusConfig = {
    draft: { label: 'Bản nháp', color: 'bg-gray-500', icon: Edit3 },
    in_progress: { label: 'Đang thực hiện', color: 'bg-blue-500', icon: Clock },
    review: { label: 'Đang review', color: 'bg-yellow-500', icon: Eye },
    published: { label: 'Đã xuất bản', color: 'bg-green-500', icon: CheckCircle },
    archived: { label: 'Lưu trữ', color: 'bg-gray-600', icon: FolderOpen },
}

const chapterStatusConfig = {
    draft: { label: 'Bản nháp', color: 'text-gray-400 bg-gray-800' },
    translating: { label: 'Đang dịch', color: 'text-blue-400 bg-blue-500/20' },
    editing: { label: 'Đang chỉnh sửa', color: 'text-yellow-400 bg-yellow-500/20' },
    proofreading: { label: 'Đang kiểm tra', color: 'text-purple-400 bg-purple-500/20' },
    published: { label: 'Đã xuất bản', color: 'text-green-400 bg-green-500/20' },
}

export default function ProjectsDashboard() {
    const [projects, setProjects] = useState<Project[]>([])
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        async function fetchData() {
            try {
                const [projectsRes, chaptersRes] = await Promise.all([
                    fetch('/api/editor/projects'),
                    fetch('/api/editor/chapters'),
                ])

                const projectsData = await projectsRes.json()
                const chaptersData = await chaptersRes.json()

                setProjects(projectsData.projects || [])
                setChapters(chaptersData.chapters || [])
            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const getProjectChapters = (projectId: string) => {
        return chapters.filter(ch => ch.project_id === projectId)
    }

    const getProgress = (project: Project) => {
        return project.chapters_total > 0
            ? Math.round((project.chapters_completed / project.chapters_total) * 100)
            : 0
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Đang tải dự án...</p>
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
                            <FolderOpen className="w-6 h-6 text-purple-400" />
                            Projects Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/editor"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            <Plus className="w-4 h-4" />
                            Mở Editor
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <FolderOpen className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{projects.length}</div>
                                <div className="text-sm text-gray-400">Dự án</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{chapters.length}</div>
                                <div className="text-sm text-gray-400">Chương</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {chapters.filter(c => c.status === 'published').length}
                                </div>
                                <div className="text-sm text-gray-400">Đã xuất bản</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {chapters.filter(c => c.status === 'editing').length}
                                </div>
                                <div className="text-sm text-gray-400">Đang chỉnh sửa</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm dự án..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-700 transition-colors">
                            <Filter className="w-4 h-4" />
                            Lọc
                        </button>

                        <div className="flex bg-gray-800 border border-gray-700 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Projects Grid/List */}
                {projects.length === 0 ? (
                    <div className="text-center py-20">
                        <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Chưa có dự án nào</h3>
                        <p className="text-gray-400 mb-6">Bắt đầu bằng cách tạo dự án dịch thuật đầu tiên</p>
                        <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium mx-auto hover:bg-purple-700 transition-colors">
                            <Plus className="w-5 h-5" />
                            Tạo dự án mới
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                        {projects.map((project) => {
                            const config = statusConfig[project.status]
                            const projectChapters = getProjectChapters(project.id)
                            const progress = getProgress(project)

                            return (
                                <div
                                    key={project.id}
                                    className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
                                >
                                    {/* Project Header */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    Demo Project
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${config.color} rounded-full text-xs text-white`}>
                                                        <config.icon className="w-3 h-3" />
                                                        {config.label}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {project.target_language.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            {project.group_id && (
                                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-400">Tiến độ</span>
                                                <span className="text-white">{progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>{project.chapters_completed} / {project.chapters_total} chương</span>
                                            </div>
                                        </div>

                                        {/* Chapters List */}
                                        <div className="space-y-2 mb-4">
                                            {projectChapters.slice(0, 3).map((chapter) => {
                                                const chConfig = chapterStatusConfig[chapter.status]
                                                return (
                                                    <div
                                                        key={chapter.id}
                                                        className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white text-sm">
                                                                Ch.{chapter.number}
                                                            </span>
                                                            {chapter.title && (
                                                                <span className="text-gray-400 text-sm truncate max-w-[120px]">
                                                                    {chapter.title}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-xs ${chConfig.color}`}>
                                                            {chConfig.label}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                            {projectChapters.length > 3 && (
                                                <div className="text-center text-gray-500 text-sm">
                                                    +{projectChapters.length - 3} chương khác
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/editor?project=${project.id}`}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                Chỉnh sửa
                                            </Link>
                                            <button className="flex items-center justify-center p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
