import express from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { eventRouter } from '../modules/event/event.routes';

var router = express.Router();

router.use('/auth', authRouter)
router.use('/events', eventRouter)

export default router;