import createHttpError from "http-errors";
import jwt from 'jsonwebtoken';
import { TypedReqHandler } from "../types/core/apiHandler";
import { AccessToken } from "../types/core/authToken";

export const authMiddleware: TypedReqHandler = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw createHttpError.Unauthorized("Access token required");
        }
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
            if (err) throw createHttpError.Forbidden("Invalid or expired access token");

            req.user = decoded as AccessToken;
            next();
        });
    } catch (error) {
        next(error)
    }
};
