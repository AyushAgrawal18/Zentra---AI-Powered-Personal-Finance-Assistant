import { goalRepository } from '../repositories';
import { ContributeGoalDTO, ContributeResponseDTO } from '../dto';
import { NotFoundError, ValidationError } from '../../../common/errors';
import { GOAL_MESSAGES, GOAL_STATUS_DISPLAY } from '../constants';
import { mapGoalRecordToDTO } from '../utils';

export const contributeGoalService = async (
  id: string,
  userId: string,
  dto: ContributeGoalDTO,
): Promise<ContributeResponseDTO> => {
  const existing = await goalRepository.findGoalById(id, userId);
  if (!existing) {
    throw new NotFoundError(GOAL_MESSAGES.NOT_FOUND);
  }

  // BR: completed goals cannot receive contributions
  if (existing.status === 'completed') {
    throw new ValidationError(GOAL_MESSAGES.ALREADY_COMPLETED);
  }

  // BR: cancelled goals cannot receive contributions
  if (existing.status === 'cancelled') {
    throw new ValidationError(GOAL_MESSAGES.CANCELLED_NO_CONTRIB);
  }

  // Atomically update current_amount and flip to completed if target reached
  const updated = await goalRepository.addContribution(id, userId, dto.amount);
  if (!updated) {
    throw new NotFoundError(GOAL_MESSAGES.NOT_FOUND);
  }

  const dto2 = mapGoalRecordToDTO(updated);

  return {
    currentAmount: dto2.currentAmount,
    completionPercentage: dto2.completionPercentage,
    status: dto2.status,
  };
};
