import { Router } from 'express';
import {
  addNewCatToUserHandler,
  deleteCatFromUserProfileHandler,
  getUserCatsHandler,
  updateCatDataHandler,
} from '../controllers/cats.js';
// Middleware
import { uploadImageToMinio } from '../middleware/minio.js';

const router = Router();

router.get('/get-all-user-cat-profiles/:userId', getUserCatsHandler);
router.post(
  '/add-new-user-cat/:userId',
  uploadImageToMinio,
  addNewCatToUserHandler
);
router.patch('/update-user-cat-profile/:userId/:catId', uploadImageToMinio, updateCatDataHandler);
router.delete(
  '/delete-user-cat-profile/:userId/:catId',
  deleteCatFromUserProfileHandler
);

export default router;
