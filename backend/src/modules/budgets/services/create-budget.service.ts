import { budgetRepository } from '../repositories';
import { CreateBudgetDTO, BudgetResponseDTO } from '../dto';
import { NotFoundError, ConflictError, ValidationError } from '../../../common/errors';
import { BUDGET_MESSAGES } from '../constants';
import { mapBudgetRecordToDTO } from '../utils';

export const createBudgetService = async (
  userId: string,
  dto: CreateBudgetDTO,
): Promise<BudgetResponseDTO> => {
  let categoryName: string | null = null;

  if (dto.categoryId) {
    const category = await budgetRepository.getCategory(dto.categoryId, userId);
    if (!category) {
      throw new NotFoundError(BUDGET_MESSAGES.INVALID_CATEGORY);
    }
    if (category.type !== 'expense') {
      throw new ValidationError(BUDGET_MESSAGES.INVALID_CATEGORY_TYPE);
    }
    categoryName = category.name;
  }

  const currentDate = new Date();
  const month = dto.month ?? (dto.startDate ? new Date(dto.startDate).getUTCMonth() + 1 : currentDate.getUTCMonth() + 1);
  const year = dto.year ?? (dto.startDate ? new Date(dto.startDate).getUTCFullYear() : currentDate.getUTCFullYear());

  const exists = await budgetRepository.budgetExistsForCategoryAndPeriod(
    userId,
    dto.categoryId ?? null,
    month,
    year,
  );
  if (exists) {
    throw new ConflictError(BUDGET_MESSAGES.CONFLICT);
  }

  const startDate = dto.startDate ? new Date(dto.startDate) : null;
  const endDate = dto.endDate ? new Date(dto.endDate) : null;

  const record = await budgetRepository.createBudget({
    userId,
    categoryId: dto.categoryId ?? null,
    name: dto.name,
    amount: dto.amount,
    alertThreshold: dto.alertThreshold ?? 80,
    period: dto.period ?? 'monthly',
    month,
    year,
    startDate,
    endDate,
  });

  if (categoryName && !record.category_name) {
    record.category_name = categoryName;
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
