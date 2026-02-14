import { NextFunction, Request, Response } from 'express';
import { AccessToken } from "../core/authToken";

export interface CRequest extends Request {
    user?: AccessToken;
    safeData: unknown;
}

export interface CResponse extends Response {
    customMessage?: string;
    data?: unknown;
}

export interface CNextFunction extends NextFunction {

}

export interface CRequestHandler {
    (req: CRequest, res: CResponse, next: CNextFunction): unknown;
}

const a: CRequestHandler = (req, res, next) => {
    req.user //kenapa user tidak ada
}   