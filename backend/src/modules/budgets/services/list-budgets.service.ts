import { budgetRepository } from '../repositories';
import { ListBudgetsQueryDTO, BudgetResponseDTO, PaginationMeta } from '../dto';
import { mapBudgetRecordToDTO } from '../utils';

export const listBudgetsService = async (
  userId: string,
  query: ListBudgetsQueryDTO,
): Promise<{ data: BudgetResponseDTO[]; meta: PaginationMeta }> => {
  const categoryId = query.categoryId ?? query.category;
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const result = await budgetRepository.listBudgets({
    userId,
    page,
    limit,
    search: query.search,
    categoryId,
    period: query.period,
    month: query.month,
    year: query.year,
    sort: query.sort,
    order: query.order,
  });

  const mapped = await Promise.all(
    result.rows.map(async (record) => {
      const spentAmount = await budgetRepository.calculateSpentAmount(
        userId,
        record.category_id,
        record.month,
        record.year,
        record.start_date,
        record.end_date,
      );
      return mapBudgetRecordToDTO(record, spentAmount);
    }),
  );

  let filtered = mapped;
  if (query.status) {
    const targetStatus = query.status.toUpperCase();
    filtered = mapped.filter((b) => b.status === targetStatus);
  }

  const total = result.total;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: filtered,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
