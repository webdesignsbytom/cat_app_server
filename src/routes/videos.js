import { Router } from 'express';
import {
  getMainVideo,
  getNextMainVideo,
  getPreviousMainVideo,
} from '../controllers/videos.js';

const router = Router();

router.get('/video', getMainVideo);
router.get('/next-video', getNextMainVideo);
router.get('/previous-video', getPreviousMainVideo);

export default router;
