import { Router } from 'express';
// Controllers
import { getCatOfTheDayVideo } from '../controllers/videos.js';
// Auth
import { validateAuthentication, validateAdminRole } from '../middleware/auth.js';

const router = Router();

// Routes
router.get('/cat-of-the-day', getCatOfTheDayVideo);

export default router;
