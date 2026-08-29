import { analyticsRepository } from '../repositories';
import { SpendingQueryDTO, CashFlowDTO } from '../dto';

export const getCashFlowService = async (
  userId: string,
  query: SpendingQueryDTO,
): Promise<CashFlowDTO[]> => {
  let currentBalance = 0;
  if (query.from) {
    currentBalance = await analyticsRepository.getOpeningBalance(userId, query.from);
  }

  const period = query.period || 'monthly';
  const trends = await analyticsRepository.getTrends(userId, period, query.from, query.to);

  return trends.map(t => {
    const openingBalance = currentBalance;
    currentBalance = openingBalance + t.income - t.expense;
    
    return {
      label: t.label,
      openingBalance,
      totalIncome: t.income,
      totalExpense: t.expense,
      closingBalance: currentBalance,
    };
  });
};
