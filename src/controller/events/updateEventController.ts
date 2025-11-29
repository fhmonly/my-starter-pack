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
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('desc').optional().isString(),
    body('location').optional().isString(),
    body('startAt').optional().isISO8601().toDate(),
]

const reqHandler: RequestHandler = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const [event] = await db.select().from(events).where(eq(events.id, id));
        if (!event) throw createHttpError.NotFound('Event not found');

        await db.update(events).set({ ...req.body, startAt: new Date(req.body.startAt) }).where(eq(events.id, id));
        const [updatedEvent] = await db.select().from(events).where(eq(events.id, id));
        const resultResponse: APIResponse = {
            success: true,
            message: 'Event updated.'
        }

        res.json(resultResponse);
    } catch (err) {
        next(err);
    }
};

const reqHandlerDeleteEvent: RequestHandler = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const [event] = await db.select().from(events).where(eq(events.id, id));
        if (!event) throw createHttpError.NotFound('Event not found');

        await db.delete(events).where(eq(events.id, id));
        const resultResponse: APIResponse = {
            success: true,
            message: 'Event deleted successfully'
        }

        res.json(resultResponse);
    } catch (err) {
        next(err);
    }
};

export const updateEventController = [
    reqHandler
]

export const deleteEventController = [
    reqHandlerDeleteEvent
]