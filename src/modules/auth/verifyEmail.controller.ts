import { eq } from 'drizzle-orm';
import z from 'zod';
import { BaseController } from '../../core/http/controller';
import { ZodValidator } from '../../core/validation/ZodValidator';
import { db } from '../../db';
import { authTokens, users } from '../../db/schema';
import { verifySecureToken } from '../../services/verifyToken';


const verifyEmailValidator = new ZodValidator({
    body: z.object({
        token: z.string().min(1),
    })
})

export const verifyEmailController = new BaseController({
    validator: verifyEmailValidator
}).createHandler(async (req, res, next) => {
    try {
        const { token } = req.safeData!.body;

        const record = await verifySecureToken(token, "email_verification");
        if (!record) return res.status(400).json({ message: "Invalid or expired token" });

        // mark user verified
        await db.update(users)
            .set({ isVerified: true })
            .where(eq(users.id, record.userId));

        // mark token used
        await db.update(authTokens)
            .set({ used: true })
            .where(eq(authTokens.uuid, record.uuid));

        res.json({ message: "Email verified" });
    } catch (err) {
        next(err);
    }
}) 