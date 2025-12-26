// validation/ZodValidator.ts
import { RequestHandler } from "express";
import z from "zod";
import { RESPONSE_MESSAGES } from "../../const/response";

export type ZodSchemaShape = {
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
};

export type InferZodData<T extends ZodSchemaShape> = {
    [K in keyof T]: z.infer<T[K]>;
};

export class ZodValidator<T extends ZodSchemaShape> {
    constructor(private readonly schema: z.ZodObject<T>) { }

    validate(): RequestHandler {
        return (req, res, next) => {
            const parsed = this.schema.safeParse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: RESPONSE_MESSAGES.VALIDATION_ERROR,
                    error: z.treeifyError(parsed.error),
                });
            }

            req.zodData = parsed.data;
            next();
        };
    }
}
