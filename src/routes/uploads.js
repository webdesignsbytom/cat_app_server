import { Router } from 'express';
import { uploadNewCatVideo } from '../controllers/uploads.js';

const router = Router();

router.post('/upload-video', uploadNewCatVideo);

export default router;
