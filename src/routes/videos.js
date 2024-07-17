import { Router } from 'express';
import {
  getMainVideo,
  getVideoPreview,
} from '../controllers/videos.js';

const router = Router();

router.get('/video/:videoId', getMainVideo);
// router.get('/next-video/:videoId', getNextMainVideo);
// router.get('/previous-video/:videoId', getPreviousMainVideo);
router.get('/videos/preview/:index', getVideoPreview);

export default router;
