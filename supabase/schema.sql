-- ===========================================
-- MANGA LOCALIZATION PLATFORM - DATABASE SCHEMA
-- Supabase (PostgreSQL)
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 1. USERS TABLE
-- ===========================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'reader' CHECK (role IN ('reader', 'translator', 'uploader', 'admin')),
    bio TEXT,

-- Stats
translations_count INTEGER DEFAULT 0,
uploads_count INTEGER DEFAULT 0,
reputation_score INTEGER DEFAULT 0,

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_username ON public.users (username);

CREATE INDEX idx_users_role ON public.users (role);

-- ===========================================
-- 2. GROUPS (Scanlation Teams)
-- ===========================================
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,

-- Settings
is_public BOOLEAN DEFAULT true,
is_recruiting BOOLEAN DEFAULT false,

-- Stats
members_count INTEGER DEFAULT 1,
projects_count INTEGER DEFAULT 0,

-- Owner
owner_id UUID REFERENCES public.users (id) ON DELETE SET NULL,

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_slug ON public.groups (slug);

-- ===========================================
-- 3. GROUP MEMBERS (Junction Table)
-- ===========================================
CREATE TABLE public.group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    group_id UUID REFERENCES public.groups (id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE,
    role VARCHAR(30) DEFAULT 'member' CHECK (
        role IN (
            'owner',
            'admin',
            'translator',
            'editor',
            'proofreader',
            'member'
        )
    ),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_members_user ON public.group_members (user_id);

CREATE INDEX idx_group_members_group ON public.group_members (group_id);

-- ===========================================
-- 4. SERIES (Manga Series)
-- ===========================================

CREATE TABLE public.series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    title_original VARCHAR(255), -- Original Japanese/Korean title
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    description TEXT,
    cover_url TEXT,
    banner_url TEXT,

-- Metadata
author VARCHAR(255),
    artist VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus', 'cancelled')),
    original_language VARCHAR(10) DEFAULT 'jpn',
    genres TEXT[], -- Array of genre slugs
    tags TEXT[],

-- Stats
total_chapters INTEGER DEFAULT 0,
total_views BIGINT DEFAULT 0,
followers_count INTEGER DEFAULT 0,
rating DECIMAL(3, 2) DEFAULT 0.00,
ratings_count INTEGER DEFAULT 0,

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_chapter_at TIMESTAMPTZ
);

CREATE INDEX idx_series_slug ON public.series (slug);

CREATE INDEX idx_series_status ON public.series (status);

-- ===========================================
-- 5. PROJECTS (Translation Projects)
-- ===========================================
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,

-- Assignment
group_id UUID REFERENCES public.groups (id) ON DELETE SET NULL,
uploader_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
translator_id UUID REFERENCES public.users (id) ON DELETE SET NULL,

-- Workflow
status VARCHAR(20) DEFAULT 'draft' CHECK (
    status IN (
        'draft',
        'in_progress',
        'review',
        'published',
        'archived'
    )
),
target_language VARCHAR(10) DEFAULT 'vie',

-- Progress
chapters_total INTEGER DEFAULT 0,
chapters_completed INTEGER DEFAULT 0,

-- Settings
is_public BOOLEAN DEFAULT false,
allow_collaborators BOOLEAN DEFAULT true,

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_projects_series ON public.projects (series_id);

CREATE INDEX idx_projects_group ON public.projects (group_id);

CREATE INDEX idx_projects_status ON public.projects (status);

-- ===========================================
-- 6. CHAPTERS
-- ===========================================
CREATE TABLE public.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,

-- Chapter Info
number DECIMAL(10, 2) NOT NULL, -- Supports 1.5, 2.0, etc.
volume INTEGER,
title VARCHAR(255),
slug VARCHAR(255) NOT NULL,

-- Workflow
status VARCHAR(20) DEFAULT 'draft' CHECK (
    status IN (
        'draft',
        'translating',
        'editing',
        'proofreading',
        'published'
    )
),

-- Assignment
translator_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
editor_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
proofreader_id UUID REFERENCES public.users (id) ON DELETE SET NULL,

-- Stats
pages_count INTEGER DEFAULT 0, views_count BIGINT DEFAULT 0,

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    
    UNIQUE(project_id, number)
);

CREATE INDEX idx_chapters_project ON public.chapters (project_id);

CREATE INDEX idx_chapters_series ON public.chapters (series_id);

CREATE INDEX idx_chapters_status ON public.chapters (status);

-- ===========================================
-- 7. PAGES (Core Table with Canvas Data)
-- ===========================================
CREATE TABLE public.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,

-- Page Info
page_number INTEGER NOT NULL,

-- Image URLs
original_url TEXT NOT NULL, -- Raw manga page
clean_url TEXT, -- AI-cleaned version (inpainted)
final_url TEXT, -- Rendered final version

-- Canvas State (JSONB for flexibility)
canvas_data JSONB DEFAULT '{
        "version": "1.0",
        "layers": {
            "background": { "visible": true },
            "drawing": { "visible": true, "strokes": [] },
            "shapes": { "visible": true, "items": [] },
            "text": { "visible": true, "items": [] }
        },
        "textElements": [],
        "brushStrokes": [],
        "shapes": [],
        "history": []
    }'::jsonb,

-- OCR Data
ocr_data JSONB, -- Detected text regions from AI

-- Status
status VARCHAR(20) DEFAULT 'raw' CHECK (
    status IN (
        'raw',
        'cleaned',
        'translated',
        'edited',
        'final'
    )
),

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(chapter_id, page_number)
);

CREATE INDEX idx_pages_chapter ON public.pages (chapter_id);

CREATE INDEX idx_pages_status ON public.pages (status);

-- GIN index for JSONB queries
CREATE INDEX idx_pages_canvas_data ON public.pages USING GIN (canvas_data);

-- ===========================================
-- 8. CREDITS (Attribution Tracking)
-- ===========================================

CREATE TABLE public.credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    
    role VARCHAR(30) NOT NULL CHECK (role IN ('translator', 'editor', 'proofreader', 'cleaner', 'typesetter', 'quality_check', 'raw_provider')),

-- Optional note
note TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(chapter_id, user_id, role)
);

CREATE INDEX idx_credits_chapter ON public.credits (chapter_id);

CREATE INDEX idx_credits_user ON public.credits (user_id);

-- ===========================================
-- 9. ACTIVITY LOG
-- ===========================================
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(30) NOT NULL, -- 'page', 'chapter', 'project', etc.
    entity_id UUID NOT NULL,
    metadata JSONB, -- Additional context
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON public.activity_log (user_id);

CREATE INDEX idx_activity_entity ON public.activity_log (entity_type, entity_id);

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON public.series
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();