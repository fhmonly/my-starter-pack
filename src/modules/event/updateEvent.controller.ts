import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';
import z from 'zod';
import { BaseController } from '../../core/http/controller';
import { db } from '../../db';
import { events } from '../../db/schema';

export const updateEventController = new BaseController()
    .withValidation(z.object({
        body: z.object({
            title: z.string().optional(),
            desc: z.string().optional(),
            location: z.string().optional(),
            startAt: z.date().optional(),
        })
    }))
    .createHandler(
        async (req, res, next) => {

            const id = Number(req.params.id);
            const [event] = await db.select().from(events).where(eq(events.id, id));
            if (!event) throw createHttpError.NotFound('Event not found');

            await db.update(events).set({ ...req.zodData.body, startAt: req.zodData.body.startAt }).where(eq(events.id, id));
            const [updatedEvent] = await db.select().from(events).where(eq(events.id, id));

            res.customMessage = 'Event updated successfully';
        }
    )

export const deleteEventController = new BaseController()
    .createHandler(
        async (req, res, next) => {
            const id = Number(req.params.id);
            const [event] = await db.select().from(events).where(eq(events.id, id));
            if (!event) throw createHttpError.NotFound('Event not found');

            await db.delete(events).where(eq(events.id, id));

            res.customMessage = 'Event deleted successfully';
        }
    )
