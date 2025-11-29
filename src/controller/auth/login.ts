import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { body, matchedData } from 'express-validator';
import createHttpError from 'http-errors';
import { db } from '../../db';
import { refreshTokens, users } from '../../db/schema';
import expressValidatorMiddleware from '../../middleware/expressValidatorMiddleware';
import { TypedReqHandler } from '../../types/core/apiHandler';
import { APIResponse } from '../../types/core/baseResponse';
import { generateAccessToken, generateRefreshToken } from '../../utils/core/generateToken';

const reqValidator = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
]

const reqHandler: TypedReqHandler = async (req, res, next) => {
    try {
        const { email, password } = matchedData(req);
        const withRefresh = req.query.withRefresh === 'true';

        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) throw new createHttpError.Unauthorized('Invalid credentials');

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new createHttpError.Unauthorized('Invalid credentials');

        const accessToken = generateAccessToken(user.id, user.role || 'user');
        const { token: refreshToken, jti, expiresAt, maxAge } = generateRefreshToken(user.id);
        const hashedToken = await bcrypt.hash(refreshToken, 10);

        await db.insert(refreshTokens).values({
            userId: user.id,
            token: hashedToken,
            jti,
            expiresAt,
        });

        const resultResponse: APIResponse<{
            accessToken: string,
            role: string | null,
            refreshToken?: string
        }> = {
            success: true,
            message: `Welcome ${user.name}!`,
            data: {
                accessToken,
                role: user.role
            }
        }

        if (withRefresh) {
            resultResponse.data!.refreshToken = refreshToken;
        }

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // sameSite: 'strict',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge,
        });
        res.status(200).json(resultResponse);
    } catch (err) {
        next(err);
    }
};

export const loginController = [
    reqValidator,
    expressValidatorMiddleware,
    reqHandler
]