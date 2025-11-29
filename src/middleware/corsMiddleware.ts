import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { RESPONSE_MESSAGES } from '../const/response';
import { ErrorRequestHandler } from 'express';

const isDevelopment = () => process.env.NODE_ENV === 'development'

const allowedOrigins = [
    ''
];

const corsOptions: cors.CorsOptions = {
    origin(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Check if the origin is in the allowed list
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // In development, allow all origins
        if (isDevelopment()) return callback(null, true)
        // Otherwise, block the request
        return callback(new Error(RESPONSE_MESSAGES.CORS_NOT_ALLOWED));
    },
    credentials: true,
};

export const corsMiddleware = cors(corsOptions)

export const corsExceptionMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    if (err.message === RESPONSE_MESSAGES.CORS_NOT_ALLOWED) {
        console.error('❌ CORS error:', req.headers.origin);
        return res.status(403).json({ error: RESPONSE_MESSAGES.CORS_NOT_ALLOWED });
    }
    next(err);
}