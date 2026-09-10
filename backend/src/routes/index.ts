import { Router, Request, Response } from "express";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

import { authRoutes } from "../modules/auth/routes";
import { transactionRoutes } from "../modules/transactions/routes";
import { categoryRoutes } from "../modules/categories/routes";
import { budgetRoutes } from "../modules/budgets/routes";
import { goalRoutes } from "../modules/goals/routes";
import { dashboardRoutes } from "../modules/dashboard/routes";
import { analyticsRoutes } from "../modules/analytics/routes";
import { paymentRoutes } from "../modules/payments/routes";
import { csvRoutes } from "../modules/csv/routes";
import { notificationRoutes } from "../modules/notifications/routes";
import { reportRoutes } from "../modules/reports/routes";

router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/categories", categoryRoutes);
router.use("/budgets", budgetRoutes);
router.use("/goals", goalRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/payments", paymentRoutes);
router.use("/imports/csv", csvRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reports", reportRoutes);

export default router;
