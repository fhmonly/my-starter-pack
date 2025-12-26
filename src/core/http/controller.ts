// core/BaseController.ts
import { NextFunction, Request, RequestHandler, Response } from "express";
import isHttpError, { HttpError } from 'http-errors';
import z from "zod";
import { SuccessJSONResponse } from "../../types/core/baseResponse";
import { InferZodData, ZodSchemaShape, ZodValidator } from "../validation/ZodValidator";

interface CRes<Res = unknown> extends Response {
    customMessage?: string;
    data?: Res;
}

interface CReq<ZodData = unknown> extends Request {
    zodData: ZodData;
}

type JSONData = Record<string, any>;

type CreateHandlerCB<Res extends JSONData, ZodData> =
    (req: CReq<ZodData>, res: CRes<Res>, next: NextFunction) =>
        | Res
        | void
        | HttpError
        | Promise<Res | void | HttpError>;

interface TypedReqHandler extends RequestHandler {

}

export class BaseController<TSchema extends ZodSchemaShape | undefined = undefined> {
    private validator?: ZodValidator<any>;

    withValidation<T extends ZodSchemaShape>(schema: z.ZodObject<T>) {
        const controller = new BaseController<T>();
        controller.validator = new ZodValidator(schema);
        return controller;
    }

    createHandler<Res extends Record<string, any>>(
        fn: CreateHandlerCB<
            Res,
            TSchema extends ZodSchemaShape ? InferZodData<TSchema> : unknown
        >
    ): RequestHandler {
        return async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                if (this.validator) {
                    this.validator.validate()(req, res, next);
                    if (res.headersSent) return;
                }

                const data = await fn(req as any, res as any, next);
                if (res.headersSent) return;

                if (data && isHttpError(data)) {
                    return next(data);
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
