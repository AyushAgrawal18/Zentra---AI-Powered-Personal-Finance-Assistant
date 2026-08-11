import { budgetRepository } from '../repositories';
import { BudgetSummaryDTO } from '../dto';
import { mapBudgetRecordToDTO } from '../utils';

export const getBudgetSummaryService = async (
  userId: string,
): Promise<BudgetSummaryDTO> => {
  const result = await budgetRepository.listBudgets({
    userId,
    page: 1,
    limit: 1000,
  });

  const budgetsWithProgress = await Promise.all(
    result.rows.map(async (record) => {
      const spentAmount = await budgetRepository.calculateSpentAmount(
        userId,
        record.category_id,
        record.month,
        record.year,
        record.start_date,
        record.end_date,
      );
      return mapBudgetRecordToDTO(record, spentAmount);
    }),
  );

  let totalBudgetAmount = 0;
  let totalSpentAmount = 0;
  let exceededBudgetsCount = 0;
  let nearLimitBudgetsCount = 0;
  let onTrackBudgetsCount = 0;

  for (const b of budgetsWithProgress) {
    totalBudgetAmount += b.amount;
    totalSpentAmount += b.spentAmount;

    if (b.status === 'EXCEEDED') {
      exceededBudgetsCount++;
    } else if (b.status === 'NEAR_LIMIT') {
      nearLimitBudgetsCount++;
    } else {
      onTrackBudgetsCount++;
    }
  }

  const totalRemainingAmount = totalBudgetAmount - totalSpentAmount;
  const overallUsagePercentage =
    totalBudgetAmount > 0
      ? Number(((totalSpentAmount / totalBudgetAmount) * 100).toFixed(2))
      : 0;

  return {
    totalBudgetAmount,
    totalSpentAmount,
    totalRemainingAmount,
    overallUsagePercentage,
    totalBudgets: budgetsWithProgress.length,
    activeBudgetsCount: budgetsWithProgress.length,
    exceededBudgetsCount,
    nearLimitBudgetsCount,
    onTrackBudgetsCount,
  };
};
