import { budgetRepository } from '../repositories';
import { NotFoundError } from '../../../common/errors';
import { BUDGET_MESSAGES } from '../constants';

export const deleteBudgetService = async (
  id: string,
  userId: string,
): Promise<void> => {
  const existing = await budgetRepository.findBudgetById(id, userId);
  if (!existing) {
    throw new NotFoundError(BUDGET_MESSAGES.NOT_FOUND);
  }

  const deleted = await budgetRepository.deleteBudget(id, userId);
  if (!deleted) {
    throw new NotFoundError(BUDGET_MESSAGES.NOT_FOUND);
  }
};
