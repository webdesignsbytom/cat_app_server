import { Router } from 'express';
import {
  approvePendingVideoHelper,
  getAllApprovedVideosHelper,
  getAllDeletedVideosHelper,
  getAllVideosHelper,
  getAllVideosToReviewHelper,
  getVideoByIdHelper,
  permanentlyDeleteVideoHelper,
  setVideoAsDeletedHelper,getVideoStreamHelper
} from '../controllers/videos.js';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';

const router = Router();

router.get('/get-video-stream', getVideoStreamHelper);
// Admin //
router.get('/get-all-video-items', getAllVideosHelper);
router.get('/admin/get-all-approved-videos', getAllApprovedVideosHelper);
router.get('/admin/get-videos-to-review', getAllVideosToReviewHelper);
router.get('/admin/get-deleted-videos', getAllDeletedVideosHelper);
router.get('/admin/get-video-by-id/:videoId', getVideoByIdHelper);
router.patch('/admin/approve-video/:videoId', approvePendingVideoHelper);
router.patch('/admin/set-video-to-deleted/:videoId', setVideoAsDeletedHelper);
router.delete(
  '/admin/permanently-delete-video/:videoId',
  permanentlyDeleteVideoHelper
);

export default router;
