import { budgetRepository } from '../repositories';
import { UpdateBudgetDTO, BudgetResponseDTO } from '../dto';
import { NotFoundError, ConflictError, ValidationError } from '../../../common/errors';
import { BUDGET_MESSAGES } from '../constants';
import { mapBudgetRecordToDTO } from '../utils';

export const updateBudgetService = async (
  id: string,
  userId: string,
  dto: UpdateBudgetDTO,
): Promise<BudgetResponseDTO> => {
  const existing = await budgetRepository.findBudgetById(id, userId);
  if (!existing) {
    throw new NotFoundError(BUDGET_MESSAGES.NOT_FOUND);
  }

  let targetCategoryName = existing.category_name;

  if (dto.categoryId !== undefined) {
    if (dto.categoryId === null) {
      targetCategoryName = null;
    } else {
      const category = await budgetRepository.getCategory(dto.categoryId, userId);
      if (!category) {
        throw new NotFoundError(BUDGET_MESSAGES.INVALID_CATEGORY);
      }
      if (category.type !== 'expense') {
        throw new ValidationError(BUDGET_MESSAGES.INVALID_CATEGORY_TYPE);
      }
      targetCategoryName = category.name;
    }
  }

  const targetCategoryId = dto.categoryId !== undefined ? dto.categoryId : existing.category_id;
  const targetMonth = dto.month !== undefined ? dto.month : (existing.month ?? new Date(existing.created_at).getUTCMonth() + 1);
  const targetYear = dto.year !== undefined ? dto.year : (existing.year ?? new Date(existing.created_at).getUTCFullYear());

  if (
    dto.categoryId !== undefined ||
    dto.month !== undefined ||
    dto.year !== undefined ||
    dto.period !== undefined
  ) {
    const conflict = await budgetRepository.budgetExistsForCategoryAndPeriod(
      userId,
      targetCategoryId,
      targetMonth,
      targetYear,
      id,
    );
    if (conflict) {
      throw new ConflictError(BUDGET_MESSAGES.CONFLICT);
    }
  }

  const startDate = dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : undefined;
  const endDate = dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined;

  const updatedRecord = await budgetRepository.updateBudget(id, userId, {
    name: dto.name,
    categoryId: dto.categoryId,
    amount: dto.amount,
    alertThreshold: dto.alertThreshold,
    period: dto.period,
    month: dto.month,
    year: dto.year,
    startDate,
    endDate,
  });

  if (!updatedRecord) {
    throw new NotFoundError(BUDGET_MESSAGES.NOT_FOUND);
  }

  if (targetCategoryName && !updatedRecord.category_name) {
    updatedRecord.category_name = targetCategoryName;
  }

  const spentAmount = await budgetRepository.calculateSpentAmount(
    userId,
    updatedRecord.category_id,
    updatedRecord.month,
    updatedRecord.year,
    updatedRecord.start_date,
    updatedRecord.end_date,
  );

  return mapBudgetRecordToDTO(updatedRecord, spentAmount);
};
