import { RequestHandler } from 'express';
import { db } from '../../db';
import { events, refreshTokens, users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt'
import { body } from 'express-validator';
import expressValidatorMiddleware from '../../middleware/expressValidatorMiddleware';
import createHttpError from 'http-errors';
import { generateAccessToken, generateRefreshToken } from '../../utils/core/generateToken';
import { APIResponse } from '../../types/core/baseResponse';

const reqValidator = [
    body('title').notEmpty().withMessage('Title is required'),
    body('desc').optional().isString(),
    body('location').optional().isString(),
    body('startAt').notEmpty().withMessage('Start date is required').isISO8601().toDate(),
]

const reqHandler: RequestHandler = async (req, res, next) => {
    try {
        const { title, desc, location, startAt } = req.body;
        const [newEvent] = await db.insert(events).values({ title, desc, location, startAt: new Date(startAt) }).$returningId();
        const resultResponse: APIResponse = {
            success: true,
            data: {
                id: newEvent.id
            }
        }

        res.status(201).json(resultResponse);
    } catch (err) {
        next(err);
    }
};

export const createEventController = [
    reqHandler
]