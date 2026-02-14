import 'dotenv/config';
import { Config, defineConfig } from 'drizzle-kit';
import { env } from './src/core/config/env';

let mysqlConfig: Config = {
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USERNAME,
        database: env.DB_DATABASE,
    },
}

if (!!env.DB_PASSWORD) Object.assign(mysqlConfig.dbCredentials, {
    password: env.DB_PASSWORD
} as typeof mysqlConfig['dbCredentials'])

export default defineConfig(mysqlConfig);