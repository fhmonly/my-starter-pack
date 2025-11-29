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

const reqHandler: RequestHandler = async (req, res, next) => {
    try {
        const allEvents = await db.select().from(events);

        const resultResponse: APIResponse = {
            success: true,
            data: allEvents,
        }

        res.json(resultResponse);
    } catch (err) {
        next(err);
    }
};

const reqHandlerEventDetail: RequestHandler = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const [event] = await db.select().from(events).where(eq(events.id, id));
        if (!event) throw createHttpError.NotFound('Event not found');

        const resultResponse: APIResponse = {
            success: true,
            data: event
        }

        res.json(resultResponse);
    } catch (err) {
        next(err);
    }
};

export const getEventsController = [
    reqHandler
]

export const getEventDetailController = [
    reqHandlerEventDetail
]