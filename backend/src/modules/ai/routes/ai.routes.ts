import { Router } from 'express';
import { authenticate } from '../../../common/middleware/auth';
import { validate } from '../../../common/middleware/validate';
import { insightIdParamSchema, listInsightsSchema } from '../validators';
import { getInsight, listInsightHistory, listInsights, refreshInsights } from '../controllers';

const router = Router();
router.get('/insights', authenticate, validate(listInsightsSchema), listInsights);
router.get('/insights/history', authenticate, validate(listInsightsSchema), listInsightHistory);
router.post('/insights/refresh', authenticate, refreshInsights);
router.get('/insights/:id', authenticate, validate(insightIdParamSchema), getInsight);
export default router;
