import { Router } from 'express';
import {
  getSummary,
  getSpending,
  getIncomeExpense,
  getCategories,
  getCashFlow,
  getMonthly,
  getYearly,
} from '../controllers';
import { validateRequest } from '../../../common/middleware/validation';
import { requireAuth } from '../../../common/middleware/auth';
import {
  dateRangeSchema,
  spendingQuerySchema,
  monthlyQuerySchema,
  yearlyQuerySchema,
} from '../validators';

const router = Router();

router.use(requireAuth);

router.get('/summary', validateRequest(dateRangeSchema), getSummary);
router.get('/spending', validateRequest(spendingQuerySchema), getSpending);
router.get('/income-expense', validateRequest(dateRangeSchema), getIncomeExpense);
router.get('/categories', validateRequest(dateRangeSchema), getCategories);
router.get('/cash-flow', validateRequest(spendingQuerySchema), getCashFlow);
router.get('/monthly', validateRequest(monthlyQuerySchema), getMonthly);
router.get('/yearly', validateRequest(yearlyQuerySchema), getYearly);

export { router as analyticsRoutes };
