import { categoryRepository } from '../repositories';
import { CategoryResponseDTO } from '../dto';
import { mapCategoryToResponse } from '../utils';
import { NotFoundError, AuthorizationError } from '../../../common/errors';
import { CATEGORY_MESSAGES } from '../constants';

export const getCategoryService = async (
  id: string,
  userId: string,
): Promise<CategoryResponseDTO> => {
  const category = await categoryRepository.findCategoryById(id);

  if (!category) {
    throw new NotFoundError(CATEGORY_MESSAGES.NOT_FOUND);
  }

  // User can only access their own categories or system categories
  if (category.user_id !== null && category.user_id !== userId) {
    throw new AuthorizationError(CATEGORY_MESSAGES.FORBIDDEN);
  }

  return mapCategoryToResponse(category);
};
