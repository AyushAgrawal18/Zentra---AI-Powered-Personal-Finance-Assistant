import { z } from 'zod';
import { dashboardQuerySchema } from '../validators/dashboard.validators';
import { TransactionResponseDTO } from '../../transactions/dto';
import { BudgetResponseDTO } from '../../budgets/dto';
import { GoalResponseDTO } from '../../goals/dto';

export type DashboardQueryDTO = z.infer<typeof dashboardQuerySchema>['query'];

export interface DashboardSummaryDTO {
  balance: number;
  income: number;
  expense: number;
  savings: number;
}

export interface DashboardResponseDTO {
  summary: DashboardSummaryDTO;
  budgets: BudgetResponseDTO[];
  goals: GoalResponseDTO[];
  recentTransactions: TransactionResponseDTO[];
  analytics: any; // We will use a generic any or a specific interface for analytics
  aiInsights: any[];
  notifications: any[];
}
