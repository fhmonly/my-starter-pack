import crypto from 'crypto';
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { authTokens } from '../db/schema';

export async function verifySecureToken(tokenPlain: string, type: string) {
    const tokenHash = crypto.createHash("sha256").update(tokenPlain).digest("hex");

    const record = await db.query.authTokens.findFirst({
        where: and(
            eq(authTokens.hash, tokenHash),
            eq(authTokens.type, type),
            eq(authTokens.used, false)
        )
    });

    if (!record) return null;

    // expired?
    if (new Date(record.expiresAt).getTime() < Date.now()) return null;

    return record;
}
