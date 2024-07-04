import { Router } from 'express';
import {
  getMainVideo,
  getNextMainVideo,
  getPreviousMainVideo,
  uploadMainVideo,
} from '../controllers/videos.js';

const router = Router();

router.get('/video', getMainVideo);
router.get('/next-video', getNextMainVideo);
router.get('/previous-video', getPreviousMainVideo);
router.post('/upload-video', uploadMainVideo);

export default router;
