import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';
import ms from 'ms';
import z from 'zod';
import { TOKEN_TYPES } from '../../const/db';
import { BaseController } from '../../core/http/controller';
import { generateSecureToken } from '../../core/security/generateToken';
import { db } from '../../db';
import { authTokens, users } from '../../db/schema';

const registerSchema = z.object({
    body:
        z.object({
            name: z.string().min(1, "Name is required"),
            email: z.email("Valid email required"),
            password: z.string().min(6, "Password must be at least 6 characters"),
            redirectUrl: z.url().optional(),
        })
});

export const registerController = new BaseController()
    .withValidation(registerSchema)
    .createHandler(async (req, res, next) => {
        const { name, email, password } = req.zodData.body;

        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length) throw new createHttpError.Conflict('Email already exists');

        const hashed = await bcrypt.hash(password, 10);

        const [{ insertId }] = await db.insert(users).values({ name, email, password: hashed })

        const { token, hash } = generateSecureToken();

        await db.insert(authTokens).values({
            userId: insertId,
            hash,
            type: TOKEN_TYPES.EMAIL_VERIFICATION,
            expiresAt: new Date(Date.now() + ms('15m')),
        });

        res.status(201);
        res.customMessage = "User registered successfully";
    });