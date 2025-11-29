import type { StringValue } from "ms";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            HOST: string;
            PORT: string;

            DB_HOST: string;
            DB_PORT: string;
            DB_DATABASE: string;
            DB_USERNAME: string;
            DB_PASSWORD: string;

            JWT_ACCESS_SECRET: string;
            JWT_ACCESS_LIFETIME: StringValue
            JWT_REFRESH_SECRET: string;
            JWT_REFRESH_LIFETIME: StringValue

            EMAIL_USER: string;
            EMAIL_PASS: string;
        }
    }
}