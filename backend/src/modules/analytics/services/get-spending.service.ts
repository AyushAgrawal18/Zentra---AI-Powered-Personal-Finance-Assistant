import { analyticsRepository } from '../repositories';
import { SpendingQueryDTO, TrendDTO } from '../dto';
import { validateAnalyticsCategory } from '../utils';

export const getSpendingService = async (
  userId: string,
  query: SpendingQueryDTO,
): Promise<TrendDTO[]> => {
  const period = query.period || 'monthly';
  await validateAnalyticsCategory(userId, query.category);
  return analyticsRepository.getTrends(userId, period, query.from, query.to, query.category, query.type);
};
