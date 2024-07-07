import { Router } from 'express';
import {
  approveVideoToReview,
  deleteVideoToReview,
  getNextVideoToReview,
  getTestData,
} from '../controllers/admin.js';
import {
  validateAdminRole,
  validateAuthentication,
} from '../middleware/auth.js';

const router = Router();

router.get('/admin-test', getTestData);
router.get(
  '/video-uploads/video-review/new-video',
  validateAuthentication,
  validateAdminRole,
  getNextVideoToReview
);
router.get(
  'video-uploads/video-review/new-video/next-video',
  validateAuthentication,
  validateAdminRole,
  getNextVideoToReview
);
router.get(
  'video-uploads/video-review/new-video/previous-video',
  validateAuthentication,
  validateAdminRole,
  getNextVideoToReview
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
