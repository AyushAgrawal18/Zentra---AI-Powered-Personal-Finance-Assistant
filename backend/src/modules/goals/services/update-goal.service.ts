import { goalRepository } from '../repositories';
import { UpdateGoalDTO, GoalResponseDTO } from '../dto';
import { NotFoundError, ConflictError, ValidationError } from '../../../common/errors';
import { GOAL_MESSAGES } from '../constants';
import { mapGoalRecordToDTO } from '../utils';

export const updateGoalService = async (
  id: string,
  userId: string,
  dto: UpdateGoalDTO,
): Promise<GoalResponseDTO> => {
  const existing = await goalRepository.findGoalById(id, userId);
  if (!existing) {
    throw new NotFoundError(GOAL_MESSAGES.NOT_FOUND);
  }

  // BR: cancelled goals cannot be modified
  if (existing.status === 'cancelled') {
    throw new ValidationError(GOAL_MESSAGES.ALREADY_CANCELLED);
  }

  // BR: name uniqueness per user (exclude current record)
  if (dto.name && dto.name.toLowerCase() !== existing.name.toLowerCase()) {
    const nameExists = await goalRepository.nameExistsForUser(userId, dto.name, id);
    if (nameExists) {
      throw new ConflictError(GOAL_MESSAGES.CONFLICT);
    }
  }

  // Only allow status updates to 'active' or 'cancelled' via update; 'completed' is auto-set
  let targetStatusDB: string | undefined;
  if (dto.status !== undefined) {
    targetStatusDB = dto.status; // already lowercase from validator ('active' | 'cancelled')
  }

  const updated = await goalRepository.updateGoal(id, userId, {
    name: dto.name,
    targetAmount: dto.targetAmount,
    targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
    description: dto.notes ?? dto.description,
    status: targetStatusDB,
  });

  if (!updated) {
    throw new NotFoundError(GOAL_MESSAGES.NOT_FOUND);
  }

  return mapGoalRecordToDTO(updated);
};
