import { YearlyQueryDTO, YearlySummaryDTO } from '../dto';
import { analyticsRepository } from '../repositories';

export const getYearlyService = async (
  userId: string,
  query: YearlyQueryDTO,
): Promise<YearlySummaryDTO> => {
  const year = query.year ?? new Date().getFullYear();
  
  const startDate = new Date(Date.UTC(year, 0, 1)).toISOString();
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString();

  const trends = await analyticsRepository.getTrends(userId, 'monthly', startDate, endDate);

  return {
    year,
    months: trends,
  };
};
