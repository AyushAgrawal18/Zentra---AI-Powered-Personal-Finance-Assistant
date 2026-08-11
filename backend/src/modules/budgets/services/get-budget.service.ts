import { budgetRepository } from '../repositories';
import { BudgetResponseDTO } from '../dto';
import { NotFoundError } from '../../../common/errors';
import { BUDGET_MESSAGES } from '../constants';
import { mapBudgetRecordToDTO } from '../utils';

export const getBudgetService = async (
  id: string,
  userId: string,
): Promise<BudgetResponseDTO> => {
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

  return mapBudgetRecordToDTO(record, spentAmount);
};
