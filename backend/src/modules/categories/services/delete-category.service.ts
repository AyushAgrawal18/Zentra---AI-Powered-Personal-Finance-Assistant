import { categoryRepository } from '../repositories';
import { NotFoundError, AuthorizationError } from '../../../common/errors';
import { CATEGORY_MESSAGES } from '../constants';
import { logger } from '../../../common/logger';

export const deleteCategoryService = async (
  id: string,
  userId: string,
): Promise<void> => {
  const existing = await categoryRepository.findCategoryById(id);

  if (!existing) {
    throw new NotFoundError(CATEGORY_MESSAGES.NOT_FOUND);
  }

  // Business rule BR-302: system categories cannot be deleted
  if (existing.is_system) {
    throw new AuthorizationError(CATEGORY_MESSAGES.SYSTEM_CATEGORY_DELETE_DENIED);
  }

  // Business rule: users can only delete their own categories
  if (existing.user_id !== userId) {
    throw new AuthorizationError(CATEGORY_MESSAGES.FORBIDDEN);
  }

  // Soft-delete (BR-303); the repository returns false when no row was affected
  const deleted = await categoryRepository.deleteCategory(id, userId);
  if (!deleted) {
    throw new NotFoundError(CATEGORY_MESSAGES.NOT_FOUND);
  }

  logger.info({ categoryId: id, userId }, 'Category deleted');
};
