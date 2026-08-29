import { analyticsRepository } from '../repositories';
import { SpendingQueryDTO, TrendDTO } from '../dto';

export const getSpendingService = async (
  userId: string,
  query: SpendingQueryDTO,
): Promise<TrendDTO[]> => {
  const period = query.period || 'monthly';
  return await analyticsRepository.getTrends(userId, period, query.from, query.to);
};
