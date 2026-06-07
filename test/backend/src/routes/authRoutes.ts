import { Router } from 'express';
import { signup, login, changePassword } from '../controllers/authController';
import { validateBody } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { signupSchema, loginSchema, changePasswordSchema } from '../utils/schemas';

const router = Router();

router.post('/signup', validateBody(signupSchema), signup);
router.post('/login', validateBody(loginSchema), login);
router.post('/change-password', authenticate, validateBody(changePasswordSchema), changePassword);

export default router;
