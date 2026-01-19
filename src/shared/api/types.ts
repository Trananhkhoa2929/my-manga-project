/**
 * API Types and Error Classes
 */

export interface ApiResponse<T> {
    data: T;
    status: number;
    ok: boolean;
}

export interface RequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
    withAuth?: boolean;
}

export interface ValidationError {
    field: string;
    message: string;
}

export class ApiError extends Error {
    status: number;
    errors?: ValidationError[];

    constructor(message: string, status: number, errors?: ValidationError[]) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }

    get isUnauthorized(): boolean {
        return this.status === 401;
    }

    get isForbidden(): boolean {
        return this.status === 403;
    }

    get isNotFound(): boolean {
        return this.status === 404;
    }

    get isValidationError(): boolean {
        return this.status === 422;
    }

    get isServerError(): boolean {
        return this.status >= 500;
    }
}

// Pagination types
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
