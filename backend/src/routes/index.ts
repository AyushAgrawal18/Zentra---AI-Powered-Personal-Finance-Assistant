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

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);

export default router;
