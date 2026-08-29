import { analyticsRepository } from '../repositories';
import { AnalyticsSummaryDTO, DateRangeQueryDTO } from '../dto';

export const getSummaryService = async (
  userId: string,
  query: DateRangeQueryDTO,
): Promise<AnalyticsSummaryDTO> => {
  const result = await analyticsRepository.getSummary(userId, query.from, query.to);
  const netSavings = result.totalIncome - result.totalExpense;
  const averageSpending = result.transactionCount > 0 ? result.totalExpense / result.transactionCount : 0;

  return {
    totalIncome: result.totalIncome,
    totalExpense: result.totalExpense,
    netSavings,
    transactionCount: result.transactionCount,
    averageSpending,
  };
};
