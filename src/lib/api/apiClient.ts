// ===========================================
// BASE API CLIENT
// Utility functions for API requests
// ===========================================

import { ApiResponse, ApiError } from '@/lib/types/api.types'

// ============ API Configuration ============

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// ============ Custom Error Class ============

export class ApiClientError extends Error {
    public code: string
    public details?: Record<string, unknown>

    constructor(error: ApiError) {
        super(error.message)
        this.name = 'ApiClientError'
        this.code = error.code
        this.details = error.details
    }
}

// ============ Response Handler ============

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json() as ApiResponse<T>

    if (!data.success || !response.ok) {
        throw new ApiClientError(
            data.error || {
                code: 'UNKNOWN_ERROR',
                message: 'An unexpected error occurred',
            }
        )
    }

    return data.data as T
}

// ============ Request Functions ============

export async function apiGet<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    })

    return handleResponse<T>(response)
}

export async function apiPost<T>(
    endpoint: string,
    body: unknown,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: JSON.stringify(body),
        ...options,
    })

    return handleResponse<T>(response)
}

export async function apiPostFormData<T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        ...options,
    })

    return handleResponse<T>(response)
}

export async function apiPostFormDataBlob(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        ...options,
    })

    if (!response.ok) {
        // Try to parse error response
        try {
            const data = await response.json() as ApiResponse<never>
            throw new ApiClientError(
                data.error || {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unexpected error occurred',
                }
            )
        } catch {
            throw new ApiClientError({
                code: 'REQUEST_FAILED',
                message: `Request failed with status ${response.status}`,
            })
        }
    }

    return response.blob()
}

// ============ Retry Logic ============

export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error')

            if (attempt < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
            }
        }
    }

    throw lastError
}

// ============ Cancel Token ============

export function createCancelToken(): AbortController {
    return new AbortController()
}
