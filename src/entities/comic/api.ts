/**
 * Comic API endpoints
 */

import { api, PaginatedResponse } from '@shared/api';
import { Comic, ComicSummary, ComicFilters } from './types';

const ENDPOINT = '/comics';

export const comicApi = {
    /**
     * Get list of comics with filters
     */
    getList: async (filters?: ComicFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
        }
        const query = params.toString();
        return api.get<PaginatedResponse<ComicSummary>>(
            `${ENDPOINT}${query ? `?${query}` : ''}`
        );
    },

    /**
     * Get comic by slug
     */
    getBySlug: async (slug: string) => {
        return api.get<Comic>(`${ENDPOINT}/${slug}`);
    },

    /**
     * Get comic by ID
     */
    getById: async (id: string) => {
        return api.get<Comic>(`${ENDPOINT}/id/${id}`);
    },

    /**
     * Get trending comics
     */
    getTrending: async (limit = 10) => {
        return api.get<ComicSummary[]>(`${ENDPOINT}/trending?limit=${limit}`);
    },

    /**
     * Get latest updated comics
     */
    getLatest: async (limit = 20) => {
        return api.get<ComicSummary[]>(`${ENDPOINT}/latest?limit=${limit}`);
    },

    /**
     * Get recommended comics for user
     */
    getRecommended: async (limit = 10) => {
        return api.get<ComicSummary[]>(`${ENDPOINT}/recommended?limit=${limit}`);
    },

    /**
     * Search comics
     */
    search: async (query: string, limit = 20) => {
        return api.get<ComicSummary[]>(
            `${ENDPOINT}/search?q=${encodeURIComponent(query)}&limit=${limit}`
        );
    },

    /**
     * Increment view count
     */
    incrementView: async (comicId: string) => {
        return api.post(`${ENDPOINT}/${comicId}/view`);
    },
};
