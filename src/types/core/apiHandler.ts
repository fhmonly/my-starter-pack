import { ErrorRequestHandler, RequestHandler } from "express";
import { ErrorJSONResponse, StrictAPIJSONResponse } from "./baseResponse";


interface ParamsDictionary {
    [key: string]: string;
}

export type TypedReqHandler<T = Record<string, any>> = RequestHandler<
    ParamsDictionary,
    StrictAPIJSONResponse<T>
>

export type TypedErrorReqHandler = ErrorRequestHandler<
    ParamsDictionary,
    ErrorJSONResponse
>