import { Router } from 'express';
import {
  getMainVideo,
  getNextMainVideo,
  getPreviousMainVideo,
  getVideoPreview,
} from '../controllers/videos.js';

const router = Router();

router.get('/video', getMainVideo);
router.get('/next-video', getNextMainVideo);
router.get('/previous-video', getPreviousMainVideo);
app.get('/videos/preview/:index', getVideoPreview);

export default router;
