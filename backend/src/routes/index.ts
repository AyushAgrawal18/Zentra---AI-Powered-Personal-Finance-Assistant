import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

import { authRoutes } from '../modules/auth/routes';
import { transactionRoutes } from '../modules/transactions/routes';
import { categoryRoutes } from '../modules/categories/routes';
import { budgetRoutes } from '../modules/budgets/routes';
import { goalRoutes } from '../modules/goals/routes';
import { dashboardRoutes } from '../modules/dashboard/routes';
import { analyticsRoutes } from '../modules/analytics/routes';

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
