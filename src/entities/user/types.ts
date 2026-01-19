/**
 * User Types
 */

export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatar: string | null;
    role: UserRole;
    walletBalance: number;
    createdAt: string;
    updatedAt: string;
}

export type UserRole = 'reader' | 'translator' | 'editor' | 'admin';

export interface UserProfile extends User {
    bio?: string;
    website?: string;
    twitter?: string;
    followingCount: number;
    followersCount: number;
    readCount: number;
    teamMemberships: TeamMembership[];
}

export interface TeamMembership {
    teamId: string;
    teamName: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    displayName?: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
