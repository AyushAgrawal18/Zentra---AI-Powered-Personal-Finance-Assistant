import { categoryRepository } from '../repositories';
import { ListCategoriesQueryDTO, CategoryResponseDTO, PaginationMeta } from '../dto';
import { mapCategoryToResponse } from '../utils';
import {
  CATEGORY_DEFAULT_PAGE,
  CATEGORY_DEFAULT_LIMIT,
  CATEGORY_DEFAULT_SORT,
} from '../constants';

export interface ListCategoriesResult {
  data: CategoryResponseDTO[];
  meta: PaginationMeta;
}

export const listCategoriesService = async (
  userId: string,
  query: ListCategoriesQueryDTO,
): Promise<ListCategoriesResult> => {
  const page = query.page ?? CATEGORY_DEFAULT_PAGE;
  const limit = query.limit ?? CATEGORY_DEFAULT_LIMIT;

  const { rows, total } = await categoryRepository.listCategories({
    userId,
    page,
    limit,
    search: query.search,
    type: query.type,
    system: query.system,
    sort: query.sort ?? CATEGORY_DEFAULT_SORT,
    order: query.order ?? 'asc',
  });

  return {
    data: rows.map(mapCategoryToResponse),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
