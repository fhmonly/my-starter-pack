import { RequestHandler } from 'express';
import { db } from '../../db';
import { refreshTokens, users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt'
import { body, matchedData } from 'express-validator';
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
        if (!refreshToken) throw new createHttpError.Unauthorized('Refresh token missing');

        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { jti: string, userId: number };

        const [storedToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.jti, payload.jti));
        if (!storedToken) throw new createHttpError.Unauthorized('Invalid or revoked refresh token');

        const valid = await bcrypt.compare(refreshToken, storedToken.token);
        if (!valid) throw new createHttpError.Unauthorized('Invalid or revoked refresh token');

        const [user] = await db.select().from(users).where(eq(users.id, storedToken.userId));
        if (!user) throw new createHttpError.Unauthorized('User not found');

        const accessToken = generateAccessToken(user.id, user.role || 'user');
        const resultResponse: APIResponse = {
            success: true,
            message: `Access Token refreshed.`,
            data: { accessToken }
        }
        res.json(resultResponse);
    } catch (err) {
        res.clearCookie('refreshToken');
        next(err);
    }
};

const reqValidatorWithBody = [
    body('refreshToken').notEmpty().withMessage('refreshToken required'),
]

const reqHandlerWithBody: RequestHandler = async (req, res, next) => {
    try {
        const { refreshToken } = matchedData(req);
        if (!refreshToken) throw new createHttpError.Unauthorized('Refresh token missing');

        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { jti: string, userId: number };

        const [storedToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.jti, payload.jti));
        if (!storedToken) throw new createHttpError.Unauthorized('Invalid or revoked refresh token');

        const valid = await bcrypt.compare(refreshToken, storedToken.token);
        if (!valid) throw new createHttpError.Unauthorized('Invalid or revoked refresh token');

        const [user] = await db.select().from(users).where(eq(users.id, storedToken.userId));
        if (!user) throw new createHttpError.Unauthorized('User not found');

        const accessToken = generateAccessToken(user.id, user.role || 'user');
        const resultResponse: APIResponse = {
            success: true,
            message: `Access Token refreshed.`,
            data: { accessToken }
        }
        res.json(resultResponse);
    } catch (err) {
        res.clearCookie('refreshToken');
        next(err);
    }
};

export const refreshTokenController = [
    reqHandler
]

export const refreshTokenWithBodyController = [
    reqValidatorWithBody,
    reqHandlerWithBody
]