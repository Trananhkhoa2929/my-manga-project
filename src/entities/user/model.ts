/**
 * User/Auth Store (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthCredentials, RegisterData } from './types';
import { userApi } from './api';

interface UserState {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: AuthCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
    fetchCurrentUser: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    clearError: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials: AuthCredentials) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await userApi.login(credentials);

                    // Store tokens
                    localStorage.setItem('auth_token', response.data.accessToken);
                    localStorage.setItem('refresh_token', response.data.refreshToken);

                    set({
                        user: response.data.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return true;
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Login failed',
                        isLoading: false,
                    });
                    return false;
                }
            },

            register: async (data: RegisterData) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await userApi.register(data);

                    localStorage.setItem('auth_token', response.data.accessToken);
                    localStorage.setItem('refresh_token', response.data.refreshToken);

                    set({
                        user: response.data.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return true;
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Registration failed',
                        isLoading: false,
                    });
                    return false;
                }
            },

            logout: async () => {
                try {
                    await userApi.logout();
                } catch {
                    // Ignore logout errors
                } finally {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('refresh_token');
                    set({ user: null, isAuthenticated: false });
                }
            },

            fetchCurrentUser: async () => {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    set({ isAuthenticated: false });
                    return;
                }

                try {
                    set({ isLoading: true });
                    const response = await userApi.getCurrentUser();
                    set({
                        user: response.data,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch {
                    // Token invalid or expired
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('refresh_token');
                    set({ user: null, isAuthenticated: false, isLoading: false });
                }
            },

            updateProfile: async (data: Partial<User>) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await userApi.updateProfile(data);
                    set({ user: response.data, isLoading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Update failed',
                        isLoading: false,
                    });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'mangahub-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
