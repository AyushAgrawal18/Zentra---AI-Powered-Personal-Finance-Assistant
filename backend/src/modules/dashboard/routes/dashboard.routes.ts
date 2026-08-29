import { Router } from 'express';
import { getDashboard, refreshDashboard } from '../controllers';
import { validateRequest } from '../../../common/middleware/validation';
import { requireAuth } from '../../../common/middleware/auth';
import { dashboardQuerySchema } from '../validators';

const router = Router();

router.use(requireAuth);

router.get('/', validateRequest(dashboardQuerySchema), getDashboard);
router.get('/refresh', validateRequest(dashboardQuerySchema), refreshDashboard);

export { router as dashboardRoutes };
