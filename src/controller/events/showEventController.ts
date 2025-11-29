import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';
import { db } from '../../db';
import { events } from '../../db/schema';
import { TypedReqHandler } from '../../types/core/apiHandler';
import { APIResponse } from '../../types/core/baseResponse';

const reqHandler: TypedReqHandler = async (req, res, next) => {
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

const reqHandlerEventDetail: TypedReqHandler = async (req, res, next) => {
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