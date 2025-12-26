import { RequestHandler } from "express"

export abstract class BaseValidator<SafeData extends Record<string, any> = Record<string, any>> {
    schema: unknown
    safeData?: SafeData
    abstract validate(): RequestHandler
}