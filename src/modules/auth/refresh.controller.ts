import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import z from 'zod';
import { BaseController } from '../../core/http/controller';
import { generateAccessToken } from '../../core/security/generateToken';
import { db } from '../../db';
import { sessions, users } from '../../db/schema';
dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

export const refreshTokenController = new BaseController()
    .createHandler(async (req, res, next) => {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) throw new createHttpError.Unauthorized('Refresh token missing');

            if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not set in environment variables');
            const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { jti: string, userId: number };

            const [storedToken] = await db.select().from(sessions).where(eq(sessions.jti, payload.jti));
            if (!storedToken) throw new createHttpError.Unauthorized('Invalid or revoked refresh token');

            const valid = await bcrypt.compare(refreshToken, storedToken.refresh_token);
            if (!valid) throw new createHttpError.Unauthorized('Invalid or revoked refresh token');

            const [user] = await db.select().from(users).where(eq(users.id, storedToken.userId));
            if (!user) throw new createHttpError.Unauthorized('User not found');

            const accessToken = generateAccessToken(user.id, user.role || 'user');

            res.customMessage = "Access token refreshed successfully";
            return { accessToken }
        } catch (err) {
            res.clearCookie('refreshToken');
            next(err);
        }
    })


const refreshTokenSchema = z.object({
    body:
        z.object({
            refreshToken: z.string().min(1, "refreshToken required"),
        })
});

export const refreshTokenWithBodyController = new BaseController()
    .withValidation(refreshTokenSchema)
    .createHandler(async (req, res, next) => {
        try {
            const { refreshToken } = req.zodData.body;
            if (!refreshToken) throw new createHttpError.Unauthorized('Refresh token missing');

            if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not set in environment variables');
            const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { jti: string, userId: number };

            const [storedToken] = await db.select().from(sessions).where(eq(sessions.jti, payload.jti));
            if (!storedToken) throw new createHttpError.Unauthorized('Invalid or revoked refresh token');

            const valid = await bcrypt.compare(refreshToken, storedToken.refresh_token);
            if (!valid) throw new createHttpError.Unauthorized('Invalid or revoked refresh token');

            const [user] = await db.select().from(users).where(eq(users.id, storedToken.userId));
            if (!user) throw new createHttpError.Unauthorized('User not found');

            const accessToken: string = generateAccessToken(user.id, user.role || 'user');

            res.customMessage = "Access token refreshed successfully";
            // res.data = { accessToken }
            return 'a';
        } catch (err) {
            res.clearCookie('refreshToken');
            next(err);
        }
    })
