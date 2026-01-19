/**
 * API Client with interceptors and error handling
 */

import { ApiError, ApiResponse, RequestConfig } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Custom fetch wrapper with interceptors
 */
async function request<T>(
    endpoint: string,
    config: RequestConfig = {}
): Promise<ApiResponse<T>> {
    const {
        method = 'GET',
        body,
        headers = {},
        timeout = 30000,
        withAuth = true
    } = config;

    const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE_URL}${endpoint}`;

    // Request interceptor - inject auth token
    const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...headers,
    };

    if (withAuth) {
        const token = getAuthToken();
        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Response interceptor - handle errors
        if (!response.ok) {
            const error = await parseErrorResponse(response);
            throw error;
        }

        const data = await response.json();

        return {
            data,
            status: response.status,
            ok: true,
        };
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApiError('Request timeout', 408);
            }
            throw new ApiError(error.message, 0);
        }

        throw new ApiError('Unknown error occurred', 0);
    }
}

/**
 * Parse error response from server
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
    try {
        const errorData = await response.json();
        return new ApiError(
            errorData.message || response.statusText,
            response.status,
            errorData.errors
        );
    } catch {
        return new ApiError(response.statusText, response.status);
    }
}

/**
 * Get auth token from storage
 * TODO: Integrate with NextAuth session
 */
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

// HTTP method shortcuts
export const api = {
    get: <T>(endpoint: string, config?: RequestConfig) =>
        request<T>(endpoint, { ...config, method: 'GET' }),

    post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
        request<T>(endpoint, { ...config, method: 'POST', body }),

    put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
        request<T>(endpoint, { ...config, method: 'PUT', body }),

    patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
        request<T>(endpoint, { ...config, method: 'PATCH', body }),

    delete: <T>(endpoint: string, config?: RequestConfig) =>
        request<T>(endpoint, { ...config, method: 'DELETE' }),
};

export default api;
