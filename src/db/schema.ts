import {
    boolean,
    int,
    mysqlEnum,
    mysqlTable,
    timestamp,
    varchar
} from "drizzle-orm/mysql-core";
import { TOKEN_TYPES } from "../const/db";

export const users = mysqlTable("users", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 128 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["user", "admin"]).default("user"),
    isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

const authTokenTypeArr = Object.values(TOKEN_TYPES) as [string, ...string[]]

export const authTokens = mysqlTable("auth_tokens", {
    uuid: varchar("uuid", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: int("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    hash: varchar("hash", { length: 255 }),
    otp: varchar("otp", { length: 6 }),
    type: mysqlEnum("type", authTokenTypeArr),
    expiresAt: timestamp("expires_at").notNull(),
    used: boolean("used").notNull().default(false),
    createdAt: timestamp("created_at")
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
});

export const events = mysqlTable('events', {
    id: int('id').primaryKey().autoincrement(),
    title: varchar("title", { length: 100 }).notNull(),
    desc: varchar("desc", { length: 255 }),
    location: varchar("location", { length: 255 }),
    startAt: timestamp("start_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
})

export const sessions = mysqlTable("sessions", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    refresh_token: varchar("refresh_token", { length: 512 }).notNull(),
    jti: varchar("jti", { length: 128 }).notNull(),
    deviceInfo: varchar("device_info", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    revokedAt: timestamp("revoked_at"),
});
