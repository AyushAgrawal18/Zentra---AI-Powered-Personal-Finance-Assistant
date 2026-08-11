import { Router } from 'express';
import {
  createGoal,
  listGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  contributeGoal,
  getGoalProgress,
} from '../controllers';
import { authenticate } from '../../../common/middleware/auth';
import { validate } from '../../../common/middleware/validate';
import {
  createGoalSchema,
  updateGoalSchema,
  listGoalsSchema,
  goalIdParamSchema,
  contributeGoalSchema,
} from '../validators';

const router = Router();

const updateGoalWithIdSchema = goalIdParamSchema.merge(updateGoalSchema);
const contributeGoalWithIdSchema = goalIdParamSchema.merge(contributeGoalSchema);

// ─── All routes require authentication ────────────────────────────────────────

router.post('/',            authenticate, validate(createGoalSchema), createGoal);
router.get('/',             authenticate, validate(listGoalsSchema), listGoals);
router.get('/:id',          authenticate, validate(goalIdParamSchema), getGoal);
router.patch('/:id',        authenticate, validate(updateGoalWithIdSchema), updateGoal);
router.delete('/:id',       authenticate, validate(goalIdParamSchema), deleteGoal);
router.post('/:id/contribute', authenticate, validate(contributeGoalWithIdSchema), contributeGoal);
router.get('/:id/progress', authenticate, validate(goalIdParamSchema), getGoalProgress);

export default router;
