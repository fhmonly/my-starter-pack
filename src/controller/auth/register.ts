import { RequestHandler } from 'express';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt'
import { body } from 'express-validator';
import expressValidatorMiddleware from '../../middleware/expressValidatorMiddleware';
import createHttpError from 'http-errors';
import { APIResponse } from '../../types/core/baseResponse';

const reqValidator = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const reqHandler: RequestHandler = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length) throw new createHttpError.Conflict('Email already exists');

        const hashed = await bcrypt.hash(password, 10);

        await db.insert(users).values({ name, email, password: hashed })

        const resultResponse: APIResponse = {
            success: true,
            message: 'User registered'
        }

        res.status(201).json(resultResponse);
    } catch (err) {
        next(err);
    }
};

export const registerController = [
    reqValidator,
    expressValidatorMiddleware,
    reqHandler
]