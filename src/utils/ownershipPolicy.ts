import createHttpError from "http-errors";

export function assertOwnership<T>(params: {
    resource: T | null;
    userId: string | number;
    getOwnerId: (resource: T) => string | number;
}) {
    if (!params.resource) {
        throw new createHttpError.NotFound("Resource not found");
    }

    const ownerId = params.getOwnerId(params.resource);

    if (ownerId !== params.userId) {
        throw new createHttpError.Forbidden("Forbidden");
    }

    return params.resource;
}
