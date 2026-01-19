/**
 * User API endpoints
 */

import { api } from '@shared/api';
import { User, UserProfile, AuthCredentials, RegisterData, AuthResponse } from './types';

export const userApi = {
    /**
     * Get current user
     */
    getCurrentUser: async () => {
        return api.get<User>('/auth/me');
    },

    /**
     * Login with credentials
     */
    login: async (credentials: AuthCredentials) => {
        return api.post<AuthResponse>('/auth/login', credentials, { withAuth: false });
    },

    /**
     * Register new user
     */
    register: async (data: RegisterData) => {
        return api.post<AuthResponse>('/auth/register', data, { withAuth: false });
    },

    /**
     * Logout
     */
    logout: async () => {
        return api.post('/auth/logout');
    },

    /**
     * Refresh access token
     */
    refreshToken: async (refreshToken: string) => {
        return api.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
    },

    /**
     * Get user profile
     */
    getProfile: async (username: string) => {
        return api.get<UserProfile>(`/users/${username}`);
    },

    /**
     * Update current user profile
     */
    updateProfile: async (data: Partial<UserProfile>) => {
        return api.patch<User>('/auth/me', data);
    },

    /**
     * Change password
     */
    changePassword: async (currentPassword: string, newPassword: string) => {
        return api.post('/auth/change-password', { currentPassword, newPassword });
    },

    /**
     * Request password reset
     */
    forgotPassword: async (email: string) => {
        return api.post('/auth/forgot-password', { email }, { withAuth: false });
    },

    /**
     * Reset password with token
     */
    resetPassword: async (token: string, newPassword: string) => {
        return api.post('/auth/reset-password', { token, newPassword }, { withAuth: false });
    },

    /**
     * Check if username is available
     */
    checkUsername: async (username: string) => {
        return api.get<{ available: boolean }>(`/auth/check-username?username=${username}`, { withAuth: false });
    },
};
