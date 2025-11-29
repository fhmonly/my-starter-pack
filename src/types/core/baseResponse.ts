
export type APIResponse<T = Record<string, any>> = {
    success: boolean;
    message?: string;
    error?: Record<string, any>,
    data?: T;
};

interface PaginatedResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export type PaginateAPIdResponse<T = Record<string, any>> =
    APIResponse<PaginatedResult<T>>

export interface ErrorAPIResponse extends APIResponse {
    success: false
}