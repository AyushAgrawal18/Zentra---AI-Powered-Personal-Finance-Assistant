import { Router } from 'express';
import {
  createBudget,
  listBudgets,
  getBudgetSummary,
  getBudget,
  getBudgetProgress,
  updateBudget,
  deleteBudget,
} from '../controllers';
import { authenticate } from '../../../common/middleware/auth';
import { validate } from '../../../common/middleware/validate';
import {
  createBudgetSchema,
  updateBudgetSchema,
  listBudgetsSchema,
  budgetIdParamSchema,
} from '../validators';

const router = Router();

const updateBudgetWithIdSchema = budgetIdParamSchema.merge(updateBudgetSchema);

// ─── All routes require authentication ────────────────────────────────────────

router.post('/',           authenticate, validate(createBudgetSchema), createBudget);
router.get('/',            authenticate, validate(listBudgetsSchema), listBudgets);
router.get('/summary',     authenticate, getBudgetSummary);
router.get('/:id',         authenticate, validate(budgetIdParamSchema), getBudget);
router.get('/:id/progress',authenticate, validate(budgetIdParamSchema), getBudgetProgress);
router.patch('/:id',       authenticate, validate(updateBudgetWithIdSchema), updateBudget);
router.delete('/:id',      authenticate, validate(budgetIdParamSchema), deleteBudget);

export default router;
