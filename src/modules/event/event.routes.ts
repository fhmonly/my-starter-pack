import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authAdminMiddleware } from '../../middleware/roleMiddleware';
import { addEventController } from './addEvent.controller';
import { showEventController, showEventDetailController } from './showEvent.controller';
import { deleteEventController, updateEventController } from './updateEvent.controller';
var router = express.Router();

router.use('/', authMiddleware)
router.get('/', showEventController)
router.get('/:id', showEventDetailController)
router.use('/', authAdminMiddleware)
router.post('/', addEventController)
router.put('/:id', updateEventController)
router.delete('/:id', deleteEventController)

export const eventRouter = router