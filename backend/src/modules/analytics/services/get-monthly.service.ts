import { transactionRepository } from '../../transactions/repositories';
import { listBudgetsService } from '../../budgets/services/list-budgets.service';
import { listGoalsService } from '../../goals/services/list-goals.service';
import { MonthlyQueryDTO, MonthlySummaryDTO } from '../dto';
import { getCategoriesService } from './get-categories.service';

export const getMonthlyService = async (
  userId: string,
  query: MonthlyQueryDTO,
): Promise<MonthlySummaryDTO> => {
  const now = new Date();
  const month = query.month ?? now.getMonth() + 1;
  const year = query.year ?? now.getFullYear();

  const [summary, budgets, goals] = await Promise.all([
    transactionRepository.monthlySummary(userId, month, year),
    listBudgetsService(userId, { month, year, page: 1, limit: 100 }),
    listGoalsService(userId, { status: 'active', page: 1, limit: 100 }),
  ]);

  // Derive start and end dates for category breakdown
  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();
  
  const categories = await getCategoriesService(userId, { from: startDate, to: endDate });
  const topSpendingCategories = categories.slice(0, 5); // top 5

  return {
    income: summary.totalIncome,
    expenses: summary.totalExpense,
    savings: summary.netBalance,
    budgetUsage: budgets.data,
    goalContributions: goals.data,
    topSpendingCategories,
  };
};
