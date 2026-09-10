import { NotFoundError } from '../../../common/errors';
import { transactionRepository } from '../../transactions/repositories';

/** Ensures a category filter is visible to the authenticated user. */
export const validateAnalyticsCategory = async (userId: string, category?: string): Promise<void> => {
  if (!category) return;

  const isAccessible = await transactionRepository.categoryExists(category, userId);
  if (!isAccessible) throw new NotFoundError('Category not found or does not belong to you.');
};
