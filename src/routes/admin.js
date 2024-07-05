import { Router } from 'express';
import {
  approveVideoToReview,
  deleteVideoToReview,
  getNextVideoToReview,
  getTestData,
} from '../controllers/admin.js';

const router = Router();

router.get('/admin-test', getTestData);
router.get('/video-uploads/video-review/next-new-video', getNextVideoToReview);
router.post(
  '/video-uploads/video-review/approve-new-video/:videoName',
  approveVideoToReview
);
router.delete(
  '/video-uploads/video-review/delete-new-video/:videoName',
  deleteVideoToReview
);

export default router;
