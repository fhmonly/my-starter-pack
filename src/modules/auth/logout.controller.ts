import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { BaseController } from '../../core/http/controller';
import { db } from '../../db';
import { sessions } from '../../db/schema';
dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

export const logoutController = new BaseController()
    .createHandler(async (req, res, next) => {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) throw new createHttpError.BadRequest('Refresh token missing');

        if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not set in environment variables');

        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { jti: string, userId: number };

        await db.delete(sessions).where(eq(sessions.jti, payload.jti));

        res.clearCookie('refreshToken');

        res.customMessage = "You have been logged out successfully";
    })

export const logoutAllController = new BaseController()
    .createHandler(async (req, res, next) => {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) throw new createHttpError.BadRequest('Refresh token missing');

        if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not set in environment variables');

        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { jti: string, userId: number };

        await db.delete(sessions).where(eq(sessions.userId, payload.userId));

        res.clearCookie('refreshToken');

        res.customMessage = "Logged out from all devices successfully";
    })