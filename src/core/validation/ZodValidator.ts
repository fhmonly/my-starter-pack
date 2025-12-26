import { RequestHandler } from "express"
import z from "zod"
import { RESPONSE_MESSAGES } from "../../const/response"
import { BaseValidator } from "./validator"

type ZodSchema = {
    body?: z.ZodObject<Record<string, z.ZodType>>,
    params?: z.ZodObject<Record<string, z.ZodType>>,
    query?: z.ZodObject<Record<string, z.ZodType>>
}

export class ZodValidator<S extends ZodSchema> implements BaseValidator {
    public schema: z.ZodObject<S>
    public safeData?: z.infer<z.ZodObject<S>>

    constructor(schema: S) {
        this.schema = z.object(schema)
        return this
    }

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

            req.safeData = parsed.data;
        };
    }
}