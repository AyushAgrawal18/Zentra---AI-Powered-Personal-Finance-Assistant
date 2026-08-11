import { goalRepository } from '../repositories';
import { NotFoundError } from '../../../common/errors';
import { GOAL_MESSAGES } from '../constants';

export const deleteGoalService = async (
  id: string,
  userId: string,
): Promise<void> => {
  // Confirm the goal exists and belongs to this user before soft-deleting
  const existing = await goalRepository.findGoalById(id, userId);
  if (!existing) {
    throw new NotFoundError(GOAL_MESSAGES.NOT_FOUND);
  }

  const deleted = await goalRepository.deleteGoal(id, userId);
  if (!deleted) {
    throw new NotFoundError(GOAL_MESSAGES.NOT_FOUND);
  }
};
