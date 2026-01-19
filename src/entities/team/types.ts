/**
 * Team Types
 */

export interface Team {
    id: string;
    name: string;
    slug: string;
    description: string;
    avatar: string | null;
    banner: string | null;
    memberCount: number;
    projectCount: number;
    isRecruiting: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TeamMember {
    id: string;
    userId: string;
    username: string;
    displayName: string;
    avatar: string | null;
    role: TeamRole;
    position: TeamPosition;
    joinedAt: string;
}

export type TeamRole = 'owner' | 'admin' | 'member';

export type TeamPosition =
    | 'translator'
    | 'typesetter'
    | 'cleaner'
    | 'proofreader'
    | 'raw_provider'
    | 'quality_checker';

export interface TeamProject {
    id: string;
    comicId: string;
    comicTitle: string;
    coverImage: string;
    status: ProjectStatus;
    assignedMembers: TeamMember[];
    createdAt: string;
    updatedAt: string;
}

export type ProjectStatus =
    | 'planning'
    | 'active'
    | 'paused'
    | 'completed'
    | 'dropped';
