import { Router } from 'express';
// Controllers
import { uploadNewCatVideoHelper } from '../controllers/uploads.js';
// Auth
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';
// Middleware
import { uploadToMinio } from '../middleware/minio.js';

const router = Router();

router.post('/upload-cat-video', uploadToMinio, uploadNewCatVideoHelper);

export default router;
