import { goalRepository } from '../repositories';
import { CreateGoalDTO, GoalResponseDTO } from '../dto';
import { ConflictError } from '../../../common/errors';
import { GOAL_MESSAGES } from '../constants';
import { mapGoalRecordToDTO } from '../utils';

export const createGoalService = async (
  userId: string,
  dto: CreateGoalDTO,
): Promise<GoalResponseDTO> => {
  // BR: goal name must be unique per user
  const nameExists = await goalRepository.nameExistsForUser(userId, dto.name);
  if (nameExists) {
    throw new ConflictError(GOAL_MESSAGES.CONFLICT);
  }

  const record = await goalRepository.createGoal({
    userId,
    name: dto.name,
    targetAmount: dto.targetAmount,
    targetDate: new Date(dto.targetDate),
    description: dto.notes ?? dto.description,
  });

  return mapGoalRecordToDTO(record);
};
