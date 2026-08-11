import { BudgetRecord } from '../repositories';
import { BudgetResponseDTO } from '../dto';

export function mapBudgetRecordToDTO(record: BudgetRecord, spentAmount: number): BudgetResponseDTO {
  const amount = parseFloat(record.amount);
  const alertThreshold = record.alert_threshold ?? 80;
  const remainingAmount = amount - spentAmount;
  const usagePercentage = amount > 0 ? Number(((spentAmount / amount) * 100).toFixed(2)) : 0;

  let status: 'ON_TRACK' | 'NEAR_LIMIT' | 'EXCEEDED' = 'ON_TRACK';
  if (spentAmount > amount) {
    status = 'EXCEEDED';
  } else if (usagePercentage >= alertThreshold) {
    status = 'NEAR_LIMIT';
  }

  const currentDate = new Date();
  const month = record.month ?? currentDate.getUTCMonth() + 1;
  const year = record.year ?? currentDate.getUTCFullYear();

  return {
    id: record.id,
    userId: record.user_id,
    name: record.name || (record.category_name ? `${record.category_name} Budget` : 'Overall Budget'),
    categoryId: record.category_id,
    categoryName: record.category_name ?? null,
    amount,
    spentAmount,
    remainingAmount,
    usagePercentage,
    alertThreshold,
    period: (record.period || 'monthly').toUpperCase(),
    month,
    year,
    startDate: record.start_date ? new Date(record.start_date).toISOString().split('T')[0] : null,
    endDate: record.end_date ? new Date(record.end_date).toISOString().split('T')[0] : null,
    status,
    createdAt: new Date(record.created_at).toISOString(),
    updatedAt: new Date(record.updated_at).toISOString(),
  };
}
