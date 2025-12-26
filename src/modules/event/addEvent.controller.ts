import z from 'zod';
import { BaseController } from '../../core/http/controller';
import { ZodValidator } from '../../core/validation/ZodValidator';
import { db } from '../../db';
import { events } from '../../db/schema';


const addEventValidator = new ZodValidator({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        desc: z.string().optional(),
        location: z.string().optional(),
        startAt: z.date().min(new Date(), 'Start date must be in the future')
    })
})

export const addEventController = new BaseController({
    validator: addEventValidator
}).createHandler(async (req, res, next) => {
    const { title, desc, location, startAt } = req.safeData!.body;
    const [newEvent] = await db
        .insert(events)
        .values({ title, desc, location, startAt: new Date(startAt) })
        .$returningId();

    res.status(201);
    res.data = {
        id: newEvent.id
    }
})