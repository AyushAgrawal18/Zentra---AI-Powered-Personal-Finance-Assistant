import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers';
import { authenticate } from '../../../common/middleware/auth';
import { validate } from '../../../common/middleware/validate';
import { registerSchema, loginSchema, refreshSchema } from '../validators';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
