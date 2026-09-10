import { analyticsRepository } from '../repositories';
import { AnalyticsSummaryDTO, DateRangeQueryDTO } from '../dto';
import { validateAnalyticsCategory } from '../utils';

export const getSummaryService = async (
  userId: string,
  query: DateRangeQueryDTO,
): Promise<AnalyticsSummaryDTO> => {
  await validateAnalyticsCategory(userId, query.category);
  const result = await analyticsRepository.getSummary(userId, query.from, query.to, query.category, query.type);
  const netSavings = result.totalIncome - result.totalExpense;
  const averageSpending = result.expenseTransactionCount > 0
    ? result.totalExpense / result.expenseTransactionCount
    : 0;

  return {
    totalIncome: result.totalIncome,
    totalExpense: result.totalExpense,
    netSavings,
    transactionCount: result.transactionCount,
    averageSpending,
  };
};
