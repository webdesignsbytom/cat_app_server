import { Router } from 'express';
import { getUserGameDataHandler } from '../controllers/game.js';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';

const router = Router();

router.get(
  '/get-user-game-data',
  validateAuthentication,
  validateDeveloperRole,
  getUserGameDataHandler
);

export default router;
