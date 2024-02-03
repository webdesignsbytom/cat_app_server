import { Router } from 'express';
// Controllers
import { getCatOfTheDayVideo } from '../controllers/videos.js';
// Auth
import { validateAuthentication, validateAdminRole } from '../middleware/auth.js';
import { getImages } from '../controllers/images.js';

const router = Router();

// Routes
router.get('/get-images', getImages);

export default router;
