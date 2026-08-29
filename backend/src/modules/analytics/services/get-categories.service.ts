import { analyticsRepository } from '../repositories';
import { DateRangeQueryDTO, CategoryBreakdownDTO } from '../dto';

export const getCategoriesService = async (
  userId: string,
  query: DateRangeQueryDTO,
): Promise<CategoryBreakdownDTO[]> => {
  const breakdown = await analyticsRepository.getCategoryBreakdown(userId, query.from, query.to);
  
  const totalExpense = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return breakdown.map(item => ({
    category: item.category,
    amount: item.amount,
    percentage: totalExpense > 0 ? Number(((item.amount / totalExpense) * 100).toFixed(2)) : 0,
  }));
};
