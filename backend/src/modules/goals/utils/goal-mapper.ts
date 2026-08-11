import { GoalRecord } from '../repositories';
import { GoalResponseDTO } from '../dto';
import { GOAL_STATUS_DISPLAY } from '../constants';

/**
 * Map a raw DB row → the canonical GoalResponseDTO.
 * All financial arithmetic happens here so every service uses one source of truth.
 */
export function mapGoalRecordToDTO(record: GoalRecord): GoalResponseDTO {
  const targetAmount = parseFloat(record.target_amount);
  const currentAmount = parseFloat(record.current_amount);
  // Never let remaining go negative in the response
  const remainingAmount = Math.max(targetAmount - currentAmount, 0);
  const completionPercentage =
    targetAmount > 0
      ? Number(Math.min((currentAmount / targetAmount) * 100, 100).toFixed(2))
      : 0;

  const displayStatus = GOAL_STATUS_DISPLAY[record.status as keyof typeof GOAL_STATUS_DISPLAY]
    ?? 'ACTIVE';

  return {
    id: record.id,
    userId: record.user_id,
    name: record.name,
    targetAmount,
    currentAmount,
    remainingAmount,
    completionPercentage,
    targetDate: new Date(record.target_date).toISOString().split('T')[0],
    notes: null,           // goals table has description; API exposes it as description
    description: record.description,
    status: displayStatus as GoalResponseDTO['status'],
    createdAt: new Date(record.created_at).toISOString(),
    updatedAt: new Date(record.updated_at).toISOString(),
  };
}
