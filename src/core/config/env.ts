import dotenv from "dotenv";
import ms, { StringValue } from "ms";
dotenv.config();

function required(key: keyof NodeJS.ProcessEnv): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing env: ${key}`);
    return value;
}

function toNumber(value: string, key: string): number {
    const parsed = Number(value);
    if (isNaN(parsed)) throw new Error(`Invalid number env: ${key}`);
    return parsed;
}

function toMs(value: unknown, key: string): number {
    if (typeof value !== "string") {
        throw new Error(`Invalid time env: ${key}`);
    }

    const parsed = ms(value as StringValue);
    if (!parsed) {
        throw new Error(`Invalid time format: ${key}`);
    }

    return parsed;
}

export const env = {
    NODE_ENV: required("NODE_ENV"),
    IS_PRODUCTION: ["production", "prod", "p"].includes(process.env.NODE_ENV?.toString().toLowerCase() || ""),
    IS_DEVELOPMENT: ["development", "test", "dev", "local", "d"].includes(process.env.NODE_ENV?.toString().toLowerCase() || ""),
    HOST: required("HOST"),
    PORT: toNumber(required("PORT"), "PORT"),

    DB_HOST: required("DB_HOST"),
    DB_PORT: toNumber(required("DB_PORT"), "DB_PORT"),
    DB_DATABASE: required("DB_DATABASE"),
    DB_USERNAME: required("DB_USERNAME"),
    DB_PASSWORD: process.env.DB_PASSWORD || "",

    JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
    JWT_ACCESS_LIFETIME: toMs(required("JWT_ACCESS_LIFETIME"), "JWT_ACCESS_LIFETIME"),
    JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
    JWT_REFRESH_LIFETIME: toMs(required("JWT_REFRESH_LIFETIME"), "JWT_REFRESH_LIFETIME"),

    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,

    RATE_LIMIT_WINDOW: toMs(required("RATE_LIMIT_WINDOW"), "RATE_LIMIT_WINDOW"),
    RATE_LIMIT_MAX: toNumber(required("RATE_LIMIT_MAX"), "RATE_LIMIT_MAX"),
};