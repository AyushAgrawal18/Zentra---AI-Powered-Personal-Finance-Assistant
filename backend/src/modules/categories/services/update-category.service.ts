import { categoryRepository } from '../repositories';
import { UpdateCategoryDTO, CategoryResponseDTO } from '../dto';
import { mapCategoryToResponse } from '../utils';
import { NotFoundError, AuthorizationError, ConflictError } from '../../../common/errors';
import { CATEGORY_MESSAGES } from '../constants';
import { logger } from '../../../common/logger';

export const updateCategoryService = async (
  id: string,
  userId: string,
  data: UpdateCategoryDTO,
): Promise<CategoryResponseDTO> => {
  const existing = await categoryRepository.findCategoryById(id);

  if (!existing) {
    throw new NotFoundError(CATEGORY_MESSAGES.NOT_FOUND);
  }

  // Business rule: system categories cannot be updated by regular users
  if (existing.is_system) {
    throw new AuthorizationError(CATEGORY_MESSAGES.SYSTEM_CATEGORY_DELETE_DENIED);
  }

  // Business rule: users can only update their own categories
  if (existing.user_id !== userId) {
    throw new AuthorizationError(CATEGORY_MESSAGES.FORBIDDEN);
  }

  // Business rule: name must remain unique per user+type combination if name changes
  if (data.name) {
    const nameConflict = await categoryRepository.nameExistsForUser(
      userId,
      data.name,
      existing.type,
      id, // exclude self
    );
    if (nameConflict) {
      throw new ConflictError(CATEGORY_MESSAGES.CONFLICT);
    }
  }

  const updated = await categoryRepository.updateCategory(id, userId, {
    name: data.name,
    icon: data.icon,
    color: data.color,
  });

  if (!updated) {
    throw new NotFoundError(CATEGORY_MESSAGES.NOT_FOUND);
  }

  logger.info({ categoryId: id, userId }, 'Category updated');

  return mapCategoryToResponse(updated);
};
