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
  const month = query.month ?? now.getUTCMonth() + 1;
  const year = query.year ?? now.getUTCFullYear();

  const [summary, budgets, goals] = await Promise.all([
    transactionRepository.monthlySummary(userId, month, year),
    listBudgetsService(userId, { month, year, page: 1, limit: 100, sort: '', order: 'asc' }),
    listGoalsService(userId, { status: 'active', page: 1, limit: 100, sort: '', order: 'asc' }),
  ]);

  // Derive start and end dates for category breakdown
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, '0')}`;
  
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
