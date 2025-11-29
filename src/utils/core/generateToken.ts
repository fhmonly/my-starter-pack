import jwt from 'jsonwebtoken';
import { users } from '../../db/schema';
import ms from 'ms';
import dotenv from 'dotenv'
dotenv.config()

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_ACCESS_LIFETIME = process.env.JWT_ACCESS_LIFETIME || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_LIFETIME = process.env.JWT_REFRESH_LIFETIME || '7d';

export const generateAccessToken = (userId: number, role: typeof users.role.enumValues[number]) => {
    const maxAge = ms(JWT_ACCESS_LIFETIME);
    return jwt.sign({ userId, role }, JWT_ACCESS_SECRET, { expiresIn: maxAge });
}


export const generateRefreshToken = (userId: number) => {
    const jti = crypto.randomUUID();
    const maxAge = ms(JWT_REFRESH_LIFETIME);
    const expiresAt = new Date(Date.now() + maxAge)
    const token = jwt.sign({ userId, jti }, JWT_REFRESH_SECRET, { expiresIn: maxAge });
    return { token, jti, expiresAt, maxAge };
};
