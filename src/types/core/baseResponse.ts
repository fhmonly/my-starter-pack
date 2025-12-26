export type SuccessJSONResponse<T = Record<string, any>> = {
    success: true;
    message?: string;
    data?: T;
};

export type ErrorJSONResponse<T = Record<string, any>> = {
    success: false;
    message?: string;
    error?: T;
};

export type GeneralAPIResponse<T = Record<string, any>> = {
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

export type PaginatedAPIJSONResponse<T = Record<string, any>> =
    SuccessJSONResponse<PaginatedResult<T>>

export type StrictAPIJSONResponse<T = Record<string, any>> = SuccessJSONResponse<T> | ErrorJSONResponse;