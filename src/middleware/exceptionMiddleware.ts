import dotenv from 'dotenv';
import createHttpError from 'http-errors';
import { isErrorInstanceOfHttpError } from '../core/http/httpError';
import { TypedErrorReqHandler } from '../types/core/apiHandler';
import { ErrorAPIResponse } from "../types/core/baseResponse";
dotenv.config()


export const exceptionMiddleware: TypedErrorReqHandler = (err, req, res, _next) => {
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
        const errorResponse: ErrorAPIResponse = {
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