import 'dotenv/config';
import { Config, defineConfig } from 'drizzle-kit';

const DB_USERNAME = process.env.DB_USERNAME || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = +(process.env.DB_PORT || 3306)
const DB_DATABASE = process.env.DB_DATABASE || ''

let mysqlConfig: Config = {
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USERNAME,
        database: DB_DATABASE,
    },
}

if (!!DB_PASSWORD) Object.assign(mysqlConfig.dbCredentials, {
    password: DB_PASSWORD
} as typeof mysqlConfig['dbCredentials'])

export default defineConfig(mysqlConfig);