import { transactionRepository } from '../../transactions/repositories';
import { listBudgetsService } from '../../budgets/services/list-budgets.service';
import { listGoalsService } from '../../goals/services/list-goals.service';
import { listTransactionsService } from '../../transactions/services/list-transactions.service';
import { getSpendingService, getCashFlowService } from '../../analytics/services';
import { DashboardResponseDTO, DashboardQueryDTO } from '../dto';

export const getDashboardService = async (
  userId: string,
  query: DashboardQueryDTO,
): Promise<DashboardResponseDTO> => {
  const now = new Date();
  const month = query.month ?? now.getMonth() + 1;
  const year = query.year ?? now.getFullYear();

  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();

  const [
    balanceResult,
    monthlySummaryResult,
    budgetsResult,
    goalsResult,
    transactionsResult,
    monthlySpending,
    cashFlow,
  ] = await Promise.all([
    transactionRepository.calculateBalance(userId),
    transactionRepository.monthlySummary(userId, month, year),
    listBudgetsService(userId, {
      month, year, page: 1, limit: 100,
      sort: '',
      order: 'asc'
    }),
    listGoalsService(userId, {
      status: 'active', page: 1, limit: 100,
      sort: '',
      order: 'asc'
    }),
    listTransactionsService(userId, {
      page: 1, limit: 10,
      sort: '',
      order: 'asc'
    }),
    getSpendingService(userId, { period: 'daily', from: startDate, to: endDate }), // daily breakdown for the month
    getCashFlowService(userId, { period: 'weekly', from: startDate, to: endDate }), // weekly cash flow for the month
  ]);

  const analytics = {
    monthlySpending,
    incomeVsExpense: {
      income: monthlySummaryResult.totalIncome,
      expense: monthlySummaryResult.totalExpense,
    },
    topCategories: monthlySummaryResult.categoryBreakdown,
    cashFlow,
  };

  return {
    summary: {
      balance: balanceResult.balance,
      income: monthlySummaryResult.totalIncome,
      expense: monthlySummaryResult.totalExpense,
      savings: monthlySummaryResult.netBalance,
    },
    budgets: budgetsResult.data,
    goals: goalsResult.data,
    recentTransactions: transactionsResult.data,
    analytics,
    aiInsights: [], // DEFERRED
    notifications: [],
  };
};

