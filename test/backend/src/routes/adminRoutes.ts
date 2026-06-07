import { Router } from 'express';
import {
  getStats,
  addUser,
  addStore,
  getStores,
  getUsers,
  getAvailableOwners,
  deleteUser,
  deleteStore,
  updateStore,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { addUserSchema, addStoreSchema } from '../utils/schemas';

const router = Router();

// Apply admin protection to all routes in this router
router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/stats', getStats);
router.post('/users', validateBody(addUserSchema), addUser);
router.post('/stores', validateBody(addStoreSchema), addStore);
router.get('/stores', getStores);
router.get('/users', getUsers);
router.get('/available-owners', getAvailableOwners);
router.delete('/users/:id', deleteUser);
router.delete('/stores/:id', deleteStore);
router.put('/stores/:id', validateBody(addStoreSchema), updateStore);

export default router;
