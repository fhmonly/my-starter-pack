import createHttpError from "http-errors";
import { TypedReqHandler } from "../types/core/apiHandler";

export const authAdminMiddleware: TypedReqHandler = (req, res, next) => {
    try {
        if (req.user?.role === 'admin') {
            return next()
        }
        throw createHttpError.Unauthorized('User not authenticated')
    } catch (error) {
        next(error)
    }
};
