import { categoryRepository } from '../repositories';
import { CreateCategoryDTO, CategoryResponseDTO } from '../dto';
import { mapCategoryToResponse } from '../utils';
import { ConflictError } from '../../../common/errors';
import { CATEGORY_MESSAGES } from '../constants';
import { logger } from '../../../common/logger';

export const createCategoryService = async (
  userId: string,
  data: CreateCategoryDTO,
): Promise<CategoryResponseDTO> => {
  // Business rule: name must be unique per user+type combination
  const exists = await categoryRepository.nameExistsForUser(userId, data.name, data.type);
  if (exists) {
    throw new ConflictError(CATEGORY_MESSAGES.CONFLICT);
  }

  const category = await categoryRepository.createCategory({
    userId,
    name: data.name,
    type: data.type,
    icon: data.icon,
    color: data.color,
  });

  logger.info({ categoryId: category.id, userId }, 'Category created');

  return mapCategoryToResponse(category);
};
