import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { db } from '../../db';
import { refreshTokens } from '../../db/schema';
import { TypedReqHandler } from '../../types/core/apiHandler';
import { APIResponse } from '../../types/core/baseResponse';
dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

const reqHandler: TypedReqHandler = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) throw new createHttpError.BadRequest('Refresh token missing');

        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { jti: string, userId: number };

        await db.delete(refreshTokens).where(eq(refreshTokens.jti, payload.jti));

        res.clearCookie('refreshToken');
        const resultResponse: APIResponse = {
            success: true,
            message: "Logged out successfully"
        }
        res.json(resultResponse);
    } catch (err) {
        res.clearCookie('refreshToken');
        next(err);
    }
};

const reqHandlerLogoutAll: TypedReqHandler = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) throw new createHttpError.BadRequest('Refresh token missing');

        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { jti: string, userId: number };

        await db.delete(refreshTokens).where(eq(refreshTokens.userId, payload.userId));

        res.clearCookie('refreshToken');
        const resultResponse: APIResponse = {
            success: true,
            message: "Logged out from all devices successfully"
        }
        res.json(resultResponse);
    } catch (err) {
        next(err);
    }
};

export const logoutController = [
    reqHandler
]

export const logoutAllController = [
    reqHandlerLogoutAll
]