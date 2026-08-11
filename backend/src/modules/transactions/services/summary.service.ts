import { transactionRepository } from '../repositories';
import { MonthlySummaryResult } from '../repositories';

export const summaryService = async (
  userId: string,
  month: number,
  year: number,
): Promise<MonthlySummaryResult> => {
  return transactionRepository.monthlySummary(userId, month, year);
};
