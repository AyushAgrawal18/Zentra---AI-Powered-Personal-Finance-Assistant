import { Router } from 'express';
import {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getBalance,
  getMonthlySummary,
} from '../controllers';
import { authenticate } from '../../../common/middleware/auth';
import { validate } from '../../../common/middleware/validate';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsSchema,
  monthlyQuerySchema,
} from '../validators';

const router = Router();

// ─── All routes require authentication ────────────────────────────────────────
// IMPORTANT: static path segments (/balance, /summary, /monthly) MUST be declared
// before the parameterised route (/:id) to prevent Express capturing them as :id.

router.get('/balance',  authenticate, getBalance);
router.get('/summary',  authenticate, validate(monthlyQuerySchema), getMonthlySummary);
router.get('/monthly',  authenticate, validate(monthlyQuerySchema), getMonthlySummary);

router.post('/',        authenticate, validate(createTransactionSchema),   createTransaction);
router.get('/',         authenticate, validate(listTransactionsSchema),    listTransactions);
router.get('/:id',      authenticate, getTransaction);
router.patch('/:id',    authenticate, validate(updateTransactionSchema),   updateTransaction);
router.delete('/:id',   authenticate, deleteTransaction);

export default router;
