import { NextFunction, Request, RequestHandler, Response } from "express";
import isHttpError, { HttpError } from 'http-errors';
import { SuccessJSONResponse } from "../../types/core/baseResponse";
import { BaseValidator } from "../validation/validator";

type CReq<Data = unknown> = Request & {
    safeData?: Data;
}

interface CRes<Res = unknown> extends Response {
    customMessage?: string;
    data?: Res;
}

type CreateHandlerCB<
    JSONData extends Record<string, any>,
    SafeData
> = (
    req: CReq<SafeData>,
    res: CRes<JSONData>,
    next: NextFunction
) => JSONData | void | HttpError | Promise<JSONData | void | HttpError>

export class BaseController<V extends BaseValidator> {
    private validator?: V
    constructor({
        validator
    }: {
        validator?: V
    } = {}) {
        if (validator) this.validator = validator
    }

    createHandler<Res extends Record<string, any>>(
        fn: CreateHandlerCB<
            Res,
            V['safeData']
        >
    ): RequestHandler {
        return async (
            req, res, next
        ) => {
            try {
                if (this.validator) {
                    this.validator.validate()(req, res, next);
                    if (res.headersSent) return;
                }

                const data = await fn(req as any, res as any, next);
                if (res.headersSent) return;

                if (data && isHttpError(data)) {
                    next(data);
                    return
                }

                const successResponse: SuccessJSONResponse = { success: true };

                if (res.customMessage) {
                    successResponse.message = res.customMessage;
                }

                if (data !== undefined) {
                    successResponse.data = res.data ?? data;
                }

                res.json(successResponse);
            } catch (err) {
                next(err);
            }
        };
    }
}