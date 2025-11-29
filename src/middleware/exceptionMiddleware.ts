import dotenv from 'dotenv'
dotenv.config()
import { ErrorRequestHandler } from "express";
import { APIResponse } from "../types/core/baseResponse";
import { isErrorInstanceOfHttpError } from '../utils/libSupport/httpError';
import createHttpError from 'http-errors';


export const exceptionMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
    res.status(err.status || 500);
    const httpErrorMsg = err.message
    const httpError = isErrorInstanceOfHttpError(err) ? err : createHttpError.InternalServerError(httpErrorMsg)
    const httpErrorBody = httpError.BadRequest ? err?.validationErrors || err?.cause : httpError

    // if (process.env.NODE_ENV === 'development') {
    //     console.error(err);
    // }

    const isXMLHttpRequest = req.xhr
    const isJsonRequest = req.headers["content-type"] === "application/json"
    const isAcceptJson = req.headers.accept?.includes("application/json")

    if (
        isXMLHttpRequest || isJsonRequest || isAcceptJson
    ) {
        const errorResponse: APIResponse<any[]> = {
            success: false,
            message: httpError.message,
            error: httpErrorBody
        }

        res.json(errorResponse);
        return
    }

    res.locals.message = `${err.message}`;
    res.locals.error = process.env.NODE_ENV === 'development' ? err : {};
    res.render('error');
}