import { CategoryResponseDTO } from '../dto';
import { CategoryRecord } from '../repositories';

export const mapCategoryToResponse = (category: CategoryRecord): CategoryResponseDTO => ({
  id: category.id,
  userId: category.user_id,
  name: category.name,
  type: category.type,
  icon: category.icon,
  color: category.color,
  isSystem: category.is_system,
  createdAt: category.created_at.toISOString(),
  updatedAt: category.updated_at.toISOString(),
});
