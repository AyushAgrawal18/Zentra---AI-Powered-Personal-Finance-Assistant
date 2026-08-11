import { goalRepository } from '../repositories';
import { GoalProgressDTO } from '../dto';
import { NotFoundError } from '../../../common/errors';
import { GOAL_MESSAGES } from '../constants';
import { mapGoalRecordToDTO } from '../utils';

export const getGoalProgressService = async (
  id: string,
  userId: string,
): Promise<GoalProgressDTO> => {
  const record = await goalRepository.findGoalById(id, userId);
  if (!record) {
    throw new NotFoundError(GOAL_MESSAGES.NOT_FOUND);
  }

  const dto = mapGoalRecordToDTO(record);

  return {
    goalId: dto.id,
    targetAmount: dto.targetAmount,
    currentAmount: dto.currentAmount,
    remainingAmount: dto.remainingAmount,
    completionPercentage: dto.completionPercentage,
    status: dto.status,
  };
};
