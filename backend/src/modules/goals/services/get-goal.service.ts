import { goalRepository } from '../repositories';
import { GoalResponseDTO } from '../dto';
import { NotFoundError } from '../../../common/errors';
import { GOAL_MESSAGES } from '../constants';
import { mapGoalRecordToDTO } from '../utils';

export const getGoalService = async (
  id: string,
  userId: string,
): Promise<GoalResponseDTO> => {
  const record = await goalRepository.findGoalById(id, userId);
  if (!record) {
    throw new NotFoundError(GOAL_MESSAGES.NOT_FOUND);
  }
  return mapGoalRecordToDTO(record);
};
