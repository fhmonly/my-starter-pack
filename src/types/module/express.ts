import * as core from 'express-serve-static-core';
import { AccessToken } from "../core/authToken";

declare global {
    namespace Express {
        interface Request {
            user?: AccessToken;
            safeData?: unknown;
        }

        interface Response {
            customMessage?: string;
            data?: unknown;
        }
    }
}

type CustomResponse = core.Response & {
    json(data: core.Send): void;
};