import { transactionRepository } from '../repositories';
import { BalanceResult } from '../repositories';

export const balanceService = async (userId: string): Promise<BalanceResult> => {
  return transactionRepository.calculateBalance(userId);
};
