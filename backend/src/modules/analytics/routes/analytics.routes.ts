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

router.get('/summary', validateRequest(dateRangeSchema, 422), getSummary);
router.get('/spending', validateRequest(spendingQuerySchema, 422), getSpending);
router.get('/income-expense', validateRequest(dateRangeSchema, 422), getIncomeExpense);
router.get('/categories', validateRequest(dateRangeSchema, 422), getCategories);
router.get('/cash-flow', validateRequest(spendingQuerySchema, 422), getCashFlow);
router.get('/monthly', validateRequest(monthlyQuerySchema, 422), getMonthly);
router.get('/yearly', validateRequest(yearlyQuerySchema, 422), getYearly);

export { router as analyticsRoutes };
