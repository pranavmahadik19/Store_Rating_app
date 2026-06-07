import { Router } from 'express';
import { getOwnerDashboard } from '../controllers/storeOwnerController';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole(['STORE_OWNER']));

router.get('/dashboard', getOwnerDashboard);

export default router;
