export const TOKEN_TYPES = {
    EMAIL_VERIFICATION: "email_verification",
    RESET_PASSWORD: "reset_password",
} as const;

export type TokenType = typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES];
