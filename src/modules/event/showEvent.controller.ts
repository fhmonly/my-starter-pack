import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';
import { BaseController } from '../../core/http/controller';
import { db } from '../../db';
import { events } from '../../db/schema';

export const showEventController = new BaseController()
    .createHandler(async (req, res, next) => {
        const allEvents = await db.select().from(events);
        res.data = allEvents
    })

export const showEventDetailController = new BaseController()
    .createHandler(async (req, res, next) => {
        const id = Number(req.params.id);
        const [event] = await db.select().from(events).where(eq(events.id, id));
        if (!event) throw createHttpError.NotFound('Event not found');

        res.data = event
    })
