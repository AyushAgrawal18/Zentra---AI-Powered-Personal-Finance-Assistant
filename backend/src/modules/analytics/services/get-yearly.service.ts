import { YearlyQueryDTO, YearlySummaryDTO } from '../dto';
import { analyticsRepository } from '../repositories';

export const getYearlyService = async (
  userId: string,
  query: YearlyQueryDTO,
): Promise<YearlySummaryDTO> => {
  const year = query.year ?? new Date().getUTCFullYear();
  
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const trends = await analyticsRepository.getTrends(userId, 'monthly', startDate, endDate);

  return {
    year,
    months: trends,
  };
};
