import { Router } from 'express';
// Controllers
import { getCatOfTheDayVideo, uploadNewCatOfTheDayVideo } from '../controllers/videos.js';
// Auth
import { validateAuthentication, validateAdminRole } from '../middleware/auth.js';

const router = Router();

// Routes
router.get('/cat-of-the-day', getCatOfTheDayVideo);
router.post('/upload/cat-of-the-day-video', uploadNewCatOfTheDayVideo);

export default router;
