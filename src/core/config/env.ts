import dotenv from "dotenv";
import ms from "ms";
dotenv.config();

function toMs(defaultString: ms.StringValue, stringValue?: string): number {
    const numberValue = Number(stringValue);
    if (!isNaN(numberValue)) return numberValue

    const defaultResult = ms(defaultString);
    try {
        if (!stringValue) return defaultResult
        const result = ms(stringValue as ms.StringValue);
        if (result < 1) return defaultResult
        return result
    } catch (error) {
        return defaultResult
    }
}

export const env = {
    NODE_ENV: process.env?.NODE_ENV || "development",
    HOST: process.env?.HOST || "localhost",
    PORT: Number(process.env?.PORT) || 3000,

    DB_HOST: process.env?.DB_HOST || "localhost",
    DB_PORT: Number(process.env?.DB_PORT) || 3306,
    DB_DATABASE: process.env?.DB_DATABASE || "",
    DB_USERNAME: process.env?.DB_USERNAME || "",
    DB_PASSWORD: process.env?.DB_PASSWORD || "",

    JWT_ACCESS_SECRET: process.env?.JWT_ACCESS_SECRET || "",
    JWT_ACCESS_LIFETIME: toMs("15m", process.env?.JWT_ACCESS_LIFETIME),
    JWT_REFRESH_SECRET: process.env?.JWT_REFRESH_SECRET || "",
    JWT_REFRESH_LIFETIME: toMs("30d", process.env?.JWT_REFRESH_LIFETIME),

    EMAIL_USER: process.env?.EMAIL_USER || "",
    EMAIL_PASS: process.env?.EMAIL_PASS || "",
};
