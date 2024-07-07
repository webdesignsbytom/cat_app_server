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
  '/video-uploads/video-review/next-new-video',
  validateAuthentication,
  validateAdminRole,
  getNextVideoToReview
);
router.post(
  '/video-uploads/video-review/approve-new-video/:videoName',
  validateAuthentication,
  validateAdminRole,
  approveVideoToReview
);
router.delete(
  '/video-uploads/video-review/delete-new-video/:videoName',
  validateAuthentication,
  validateAdminRole,
  deleteVideoToReview
);

export default router;
