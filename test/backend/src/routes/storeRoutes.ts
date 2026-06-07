import { Router } from 'express';
import { getStores, submitRating } from '../controllers/storeController';
import { authenticate, requireRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { ratingSchema } from '../utils/schemas';

const router = Router();

// Apply normal user protection to all store rating routes
router.use(authenticate);
router.use(requireRole(['NORMAL']));

router.get('/', getStores);
router.post('/:storeId/rate', validateBody(ratingSchema), submitRating);

export default router;
