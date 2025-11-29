import { RequestHandler } from 'express';
import { db } from '../../db';
import { refreshTokens, users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt'
import { body } from 'express-validator';
import expressValidatorMiddleware from '../../middleware/expressValidatorMiddleware';
import createHttpError from 'http-errors';
import { generateAccessToken, generateRefreshToken } from '../../utils/core/generateToken';
import { APIResponse } from '../../types/core/baseResponse';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

const reqHandler: RequestHandler = async (req, res, next) => {
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

const reqHandlerLogoutAll: RequestHandler = async (req, res, next) => {
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