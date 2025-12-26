import z from 'zod';
import { BaseController } from '../../core/http/controller';
import { db } from '../../db';
import { events } from '../../db/schema';

export const addEventController = new BaseController()
    .withValidation(z.object({
        body: z.object({
            title: z.string().min(1, 'Title is required'),
            desc: z.string().optional(),
            location: z.string().optional(),
            startAt: z.date().min(new Date(), 'Start date must be in the future')
        })
    }))
    .createHandler(async (req, res, next) => {
        const { title, desc, location, startAt } = req.zodData.body;
        const [newEvent] = await db.insert(events).values({ title, desc, location, startAt: new Date(startAt) }).$returningId();

        res.status(201);
        res.data = {
            id: newEvent.id
        }
    })