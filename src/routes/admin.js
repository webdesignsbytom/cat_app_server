import { Router } from 'express';
import {
  approveVideoToReview,
  deleteVideoToReview,
  getVideoToReview,
  getTestData,
  getNextReviewVideo,
  getPreviousReviewVideo,
} from '../controllers/admin.js';
import {
  validateAdminRole,
  validateAuthentication,
} from '../middleware/auth.js';

const router = Router();

router.get('/admin-test', getTestData);
router.get(
  '/video-uploads/video-review/get-video',
  validateAuthentication,
  validateAdminRole,
  getVideoToReview
);
router.get(
  'video-uploads/video-review/get-video/next-video',
  validateAuthentication,
  validateAdminRole,
  getNextReviewVideo
);
router.get(
  'video-uploads/video-review/get-video/previous-video',
  validateAuthentication,
  validateAdminRole,
  getPreviousReviewVideo
);
router.post(
  '/video-uploads/video-review/new-video/approve-new-video/:videoName',
  validateAuthentication,
  validateAdminRole,
  approveVideoToReview
);
router.delete(
  '/video-uploads/video-review/new-video/delete-new-video/:videoName',
  validateAuthentication,
  validateAdminRole,
  deleteVideoToReview
);

export default router;
