import type { AccessToken } from "../core/authToken";

declare module "express-serve-static-core" {
    interface Request {
        user?: AccessToken;
    }
}