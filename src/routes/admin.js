import { Router } from 'express';
import { getTestData } from '../controllers/admin.js';

const router = Router();

router.get('/admin-test', getTestData);

export default router;
