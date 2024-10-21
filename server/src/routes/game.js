import { Router } from 'express';
import { getUserGameDataHandler, resetForNewGameHandler } from '../controllers/game.js';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';

const router = Router();

router.get('/get-user-game-data/:gameId', getUserGameDataHandler);
router.patch('/reset-game-data/:gameId', resetForNewGameHandler);

export default router;
