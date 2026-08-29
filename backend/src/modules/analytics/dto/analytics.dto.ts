import { z } from 'zod';
import { spendingQuerySchema, monthlyQuerySchema, yearlyQuerySchema, dateRangeSchema } from '../validators/analytics.validators';

export type DateRangeQueryDTO = z.infer<typeof dateRangeSchema>['query'];
export type SpendingQueryDTO = z.infer<typeof spendingQuerySchema>['query'];
export type MonthlyQueryDTO = z.infer<typeof monthlyQuerySchema>['query'];
export type YearlyQueryDTO = z.infer<typeof yearlyQuerySchema>['query'];

export interface AnalyticsSummaryDTO {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
  averageSpending: number;
}

export interface IncomeExpenseDTO {
  income: number;
  expense: number;
  savings: number;
}

export interface CategoryBreakdownDTO {
  category: string;
  amount: number;
  percentage: number;
}

export interface CashFlowDTO {
  label: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  closingBalance: number;
}

export interface TrendDTO {
  label: string;
  income: number;
  expense: number;
}

export interface MonthlySummaryDTO {
  income: number;
  expenses: number;
  savings: number;
  budgetUsage: any[];
  goalContributions: any[];
  topSpendingCategories: CategoryBreakdownDTO[];
}

export interface YearlySummaryDTO {
  year: number;
  months: TrendDTO[];
}
