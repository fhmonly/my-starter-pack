import { RequestHandler } from "express";

export type SchemaShape = {
    body?: any;
    query?: any;
    params?: any;
};


export abstract class BaseValidator {
    abstract validate(): RequestHandler;
}
