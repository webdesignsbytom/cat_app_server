import { Router } from 'express';
import { deleteVideoToReview, getNextVideoToReview, getTestData } from '../controllers/admin.js';

const router = Router();

router.get('/admin-test', getTestData);
router.get('/video-uploads/video-review/next-new-video', getNextVideoToReview)
router.delete('/video-uploads/video-review/delete-new-video/:newVideoId', deleteVideoToReview)

export default router;
