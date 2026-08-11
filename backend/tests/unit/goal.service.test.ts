import { goalRepository } from '../../src/modules/goals/repositories';
import { createGoalService } from '../../src/modules/goals/services/create-goal.service';
import { getGoalService } from '../../src/modules/goals/services/get-goal.service';
import { listGoalsService } from '../../src/modules/goals/services/list-goals.service';
import { updateGoalService } from '../../src/modules/goals/services/update-goal.service';
import { deleteGoalService } from '../../src/modules/goals/services/delete-goal.service';
import { contributeGoalService } from '../../src/modules/goals/services/contribute-goal.service';
import { getGoalProgressService } from '../../src/modules/goals/services/goal-progress.service';
import { NotFoundError, ConflictError, ValidationError } from '../../src/common/errors';

jest.mock('../../src/modules/goals/repositories');

const repo = goalRepository;

const mockGoal = {
  id: 'goal-uuid-1',
  user_id: 'user-uuid-1',
  name: 'New Laptop',
  description: 'For work and development.',
  target_amount: '120000.00',
  current_amount: '30000.00',
  target_date: new Date('2027-03-31'),
  status: 'active',
  created_at: new Date('2026-08-01T10:00:00.000Z'),
  updated_at: new Date('2026-08-01T10:00:00.000Z'),
  deleted_at: null,
};

const mockCompletedGoal = {
  ...mockGoal,
  current_amount: '120000.00',
  status: 'completed',
};

const mockCancelledGoal = {
  ...mockGoal,
  status: 'cancelled',
};

beforeEach(() => {
  jest.clearAllMocks();
  (repo.createGoal as jest.Mock) = jest.fn().mockResolvedValue(mockGoal);
  (repo.findGoalById as jest.Mock) = jest.fn().mockResolvedValue(mockGoal);
  (repo.listGoals as jest.Mock) = jest.fn().mockResolvedValue({ rows: [mockGoal], total: 1 });
  (repo.updateGoal as jest.Mock) = jest.fn().mockResolvedValue(mockGoal);
  (repo.deleteGoal as jest.Mock) = jest.fn().mockResolvedValue(true);
  (repo.addContribution as jest.Mock) = jest.fn().mockResolvedValue({
    ...mockGoal,
    current_amount: '35000.00',
  });
  (repo.nameExistsForUser as jest.Mock) = jest.fn().mockResolvedValue(false);
});

// ── createGoalService ────────────────────────────────────────────────────────
describe('createGoalService', () => {
  const validInput = {
    name: 'New Laptop',
    targetAmount: 120000,
    targetDate: '2027-03-31',
    notes: 'For work and development.',
  };

  it('creates a goal and returns mapped DTO', async () => {
    const result = await createGoalService('user-uuid-1', validInput);
    expect(result.id).toBe('goal-uuid-1');
    expect(result.targetAmount).toBe(120000);
    expect(result.currentAmount).toBe(30000);
    expect(result.remainingAmount).toBe(90000);
    expect(result.completionPercentage).toBe(25);
    expect(result.status).toBe('ACTIVE');
    expect(repo.createGoal).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictError when a goal with the same name exists', async () => {
    (repo.nameExistsForUser as jest.Mock).mockResolvedValue(true);
    await expect(createGoalService('user-uuid-1', validInput)).rejects.toThrow(ConflictError);
    expect(repo.createGoal).not.toHaveBeenCalled();
  });
});

// ── getGoalService ───────────────────────────────────────────────────────────
describe('getGoalService', () => {
  it('returns goal details with calculated progress', async () => {
    const result = await getGoalService('goal-uuid-1', 'user-uuid-1');
    expect(result.id).toBe('goal-uuid-1');
    expect(result.currentAmount).toBe(30000);
    expect(result.remainingAmount).toBe(90000);
    expect(repo.findGoalById).toHaveBeenCalledWith('goal-uuid-1', 'user-uuid-1');
  });

  it('throws NotFoundError when goal does not exist', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(null);
    await expect(getGoalService('no-such-id', 'user-uuid-1')).rejects.toThrow(NotFoundError);
  });
});

// ── listGoalsService ─────────────────────────────────────────────────────────
describe('listGoalsService', () => {
  it('returns paginated list of goals with metadata', async () => {
    const result = await listGoalsService('user-uuid-1', { page: 1, limit: 20 } as any);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('New Laptop');
    expect(result.meta.total).toBe(1);
  });
});

// ── updateGoalService ─────────────────────────────────────────────────────────
describe('updateGoalService', () => {
  it('updates goal target amount successfully', async () => {
    const updatedRecord = { ...mockGoal, target_amount: '150000.00' };
    (repo.updateGoal as jest.Mock).mockResolvedValue(updatedRecord);

    const result = await updateGoalService('goal-uuid-1', 'user-uuid-1', {
      targetAmount: 150000,
    });
    expect(result.targetAmount).toBe(150000);
  });

  it('throws ValidationError when updating a cancelled goal', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(mockCancelledGoal);
    await expect(
      updateGoalService('goal-uuid-1', 'user-uuid-1', { name: 'Renamed' }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws ConflictError when updating name to an existing goal name', async () => {
    (repo.nameExistsForUser as jest.Mock).mockResolvedValue(true);
    await expect(
      updateGoalService('goal-uuid-1', 'user-uuid-1', { name: 'Existing Goal' }),
    ).rejects.toThrow(ConflictError);
  });

  it('throws NotFoundError when goal does not exist', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(null);
    await expect(
      updateGoalService('no-id', 'user-uuid-1', { targetAmount: 200000 }),
    ).rejects.toThrow(NotFoundError);
  });
});

// ── deleteGoalService ─────────────────────────────────────────────────────────
describe('deleteGoalService', () => {
  it('soft deletes goal successfully', async () => {
    await expect(deleteGoalService('goal-uuid-1', 'user-uuid-1')).resolves.not.toThrow();
    expect(repo.deleteGoal).toHaveBeenCalledWith('goal-uuid-1', 'user-uuid-1');
  });

  it('throws NotFoundError when goal is not found', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(null);
    await expect(deleteGoalService('no-id', 'user-uuid-1')).rejects.toThrow(NotFoundError);
  });
});

// ── contributeGoalService ────────────────────────────────────────────────────
describe('contributeGoalService', () => {
  it('adds contribution and returns updated metrics', async () => {
    const result = await contributeGoalService('goal-uuid-1', 'user-uuid-1', { amount: 5000 });
    expect(result.currentAmount).toBe(35000);
    expect(result.completionPercentage).toBe(29.17);
    expect(result.status).toBe('ACTIVE');
  });

  it('auto-completes goal when contribution reaches target amount', async () => {
    (repo.addContribution as jest.Mock).mockResolvedValue({
      ...mockGoal,
      current_amount: '120000.00',
      status: 'completed',
    });

    const result = await contributeGoalService('goal-uuid-1', 'user-uuid-1', { amount: 90000 });
    expect(result.currentAmount).toBe(120000);
    expect(result.completionPercentage).toBe(100);
    expect(result.status).toBe('COMPLETED');
  });

  it('throws ValidationError when contributing to a completed goal', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(mockCompletedGoal);
    await expect(
      contributeGoalService('goal-uuid-1', 'user-uuid-1', { amount: 1000 }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when contributing to a cancelled goal', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(mockCancelledGoal);
    await expect(
      contributeGoalService('goal-uuid-1', 'user-uuid-1', { amount: 1000 }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws NotFoundError when goal is not found', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(null);
    await expect(
      contributeGoalService('no-id', 'user-uuid-1', { amount: 5000 }),
    ).rejects.toThrow(NotFoundError);
  });
});

// ── getGoalProgressService ───────────────────────────────────────────────────
describe('getGoalProgressService', () => {
  it('returns progress details', async () => {
    const progress = await getGoalProgressService('goal-uuid-1', 'user-uuid-1');
    expect(progress.goalId).toBe('goal-uuid-1');
    expect(progress.targetAmount).toBe(120000);
    expect(progress.currentAmount).toBe(30000);
    expect(progress.remainingAmount).toBe(90000);
    expect(progress.completionPercentage).toBe(25);
    expect(progress.status).toBe('ACTIVE');
  });
});
