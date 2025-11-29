import { ErrorRequestHandler, RequestHandler } from "express";
import { APIResponse, ErrorAPIResponse } from "./baseResponse";


interface ParamsDictionary {
    [key: string]: string;
}

export type TypedReqHandler = RequestHandler<
    ParamsDictionary,
    APIResponse
>

export type TypedErrorReqHandler = ErrorRequestHandler<
    ParamsDictionary,
    ErrorAPIResponse
>