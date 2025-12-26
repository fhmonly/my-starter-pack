import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';
import z from 'zod';
import { BaseController } from '../../core/http/controller';
import { generateAccessToken, generateRefreshToken } from '../../core/security/generateToken';
import { ZodValidator } from '../../core/validation/ZodValidator';
import { db } from '../../db';
import { sessions, users } from '../../db/schema';

const loginValidator = new ZodValidator({
    body: z.object({
        email: z.email("Valid email required"),
        password: z.string().min(1, "Password required"),
    })
});

export const loginController = new BaseController({
    validator: loginValidator
}).createHandler(async (req, res) => {
    const { email, password } = req.safeData!.body;
    const withRefresh = req.query.withRefresh === 'true';

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) throw new createHttpError.Unauthorized('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new createHttpError.Unauthorized('Invalid credentials');

    const isVerified = user.isVerified;
    if (!isVerified) throw new createHttpError.Unauthorized('Email verification required');

    const accessToken = generateAccessToken(user.id, user.role || 'user');
    const { token: refreshToken, jti, expiresAt, maxAge } = generateRefreshToken(user.id);
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await db.insert(sessions).values({
        userId: user.id,
        refresh_token: hashedToken,
        jti,
        expiresAt,
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // sameSite: 'strict',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge,
    });

    res.customMessage = `Welcome ${user.name}!`;
    res.status(200)
    res.data = {
        accessToken,
        role: user.role,
        refreshToken: withRefresh ? refreshToken : undefined,
    }
});