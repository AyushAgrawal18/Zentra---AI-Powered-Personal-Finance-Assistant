import { z } from 'zod';
import { createBudgetSchema, updateBudgetSchema, listBudgetsSchema } from '../validators';

export type CreateBudgetDTO = z.infer<typeof createBudgetSchema>['body'];
export type UpdateBudgetDTO = z.infer<typeof updateBudgetSchema>['body'];
export type ListBudgetsQueryDTO = z.infer<typeof listBudgetsSchema>['query'];

export interface BudgetResponseDTO {
  id: string;
  userId: string;
  name: string;
  categoryId: string | null;
  categoryName?: string | null;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  alertThreshold: number;
  period: string;
  month: number;
  year: number;
  startDate: string | null;
  endDate: string | null;
  status: 'ON_TRACK' | 'NEAR_LIMIT' | 'EXCEEDED';
  createdAt: string;
  updatedAt: string;
}

export interface BudgetProgressDTO {
  budgetId: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  status: 'ON_TRACK' | 'NEAR_LIMIT' | 'EXCEEDED';
}

export interface BudgetSummaryDTO {
  totalBudgetAmount: number;
  totalSpentAmount: number;
  totalRemainingAmount: number;
  overallUsagePercentage: number;
  totalBudgets: number;
  activeBudgetsCount: number;
  exceededBudgetsCount: number;
  nearLimitBudgetsCount: number;
  onTrackBudgetsCount: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
