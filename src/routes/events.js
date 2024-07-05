import { Router } from 'express';
import {
  deleteAllEvents,
  deleteEventById,
  getAllEvents,
} from '../controllers/events.js';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';

const router = Router();

router.get('/', validateAuthentication, validateDeveloperRole, getAllEvents);
router.delete(
  '/delete-event/:eventId',
  validateAuthentication,
  validateDeveloperRole,
  deleteEventById
);
router.delete(
  '/delete-all-events',
  validateAuthentication,
  validateDeveloperRole,
  deleteAllEvents
);

export default router;
