import { budgetRepository } from '../repositories';
import { BudgetProgressDTO } from '../dto';
import { NotFoundError } from '../../../common/errors';
import { BUDGET_MESSAGES } from '../constants';
import { mapBudgetRecordToDTO } from '../utils';

export const getBudgetProgressService = async (
  id: string,
  userId: string,
): Promise<BudgetProgressDTO> => {
  const record = await budgetRepository.findBudgetById(id, userId);
  if (!record) {
    throw new NotFoundError(BUDGET_MESSAGES.NOT_FOUND);
  }

  const spentAmount = await budgetRepository.calculateSpentAmount(
    userId,
    record.category_id,
    record.month,
    record.year,
    record.start_date,
    record.end_date,
  );

  const dto = mapBudgetRecordToDTO(record, spentAmount);

  return {
    budgetId: dto.id,
    budgetAmount: dto.amount,
    spentAmount: dto.spentAmount,
    remainingAmount: dto.remainingAmount,
    usagePercentage: dto.usagePercentage,
    status: dto.status,
  };
};
