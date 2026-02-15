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