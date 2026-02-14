import rateLimit from "express-rate-limit";
import { env } from "../core/config/env";

export const globalRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW,
    max: env.RATE_LIMIT_MAX,                 // max 100 request / IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests"
    }
});
