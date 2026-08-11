import { goalRepository } from '../repositories';
import { ListGoalsQueryDTO, GoalResponseDTO, PaginationMeta } from '../dto';
import { mapGoalRecordToDTO } from '../utils';

export const listGoalsService = async (
  userId: string,
  query: ListGoalsQueryDTO,
): Promise<{ data: GoalResponseDTO[]; meta: PaginationMeta }> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const result = await goalRepository.listGoals({
    userId,
    page,
    limit,
    search: query.search,
    status: query.status,
    sort: query.sort,
    order: query.order,
  });

  const data = result.rows.map(mapGoalRecordToDTO);
  const total = result.total;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    meta: { page, limit, total, totalPages },
  };
};
