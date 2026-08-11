import { budgetRepository } from '../../src/modules/budgets/repositories';
import { createBudgetService } from '../../src/modules/budgets/services/create-budget.service';
import { getBudgetService } from '../../src/modules/budgets/services/get-budget.service';
import { listBudgetsService } from '../../src/modules/budgets/services/list-budgets.service';
import { updateBudgetService } from '../../src/modules/budgets/services/update-budget.service';
import { deleteBudgetService } from '../../src/modules/budgets/services/delete-budget.service';
import { getBudgetProgressService } from '../../src/modules/budgets/services/budget-progress.service';
import { getBudgetSummaryService } from '../../src/modules/budgets/services/budget-summary.service';
import { NotFoundError, ConflictError, ValidationError } from '../../src/common/errors';

jest.mock('../../src/modules/budgets/repositories');

const repo = budgetRepository;

const mockBudget = {
  id: 'budget-uuid-1',
  user_id: 'user-uuid-1',
  category_id: 'cat-uuid-1',
  category_name: 'Food',
  name: 'Monthly Food Budget',
  amount: '10000.00',
  spent_amount: '0.00',
  remaining_amount: null,
  alert_threshold: 80,
  period: 'monthly',
  month: 8,
  year: 2026,
  start_date: null,
  end_date: null,
  status: 'active',
  created_at: new Date('2026-08-01T10:00:00.000Z'),
  updated_at: new Date('2026-08-01T10:00:00.000Z'),
  deleted_at: null,
};

const mockExpenseCategory = {
  id: 'cat-uuid-1',
  name: 'Food',
  type: 'expense',
  is_system: false,
};

const mockIncomeCategory = {
  id: 'cat-inc-1',
  name: 'Salary',
  type: 'income',
  is_system: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  (repo.getCategory as jest.Mock) = jest.fn().mockResolvedValue(mockExpenseCategory);
  (repo.createBudget as jest.Mock) = jest.fn().mockResolvedValue(mockBudget);
  (repo.findBudgetById as jest.Mock) = jest.fn().mockResolvedValue(mockBudget);
  (repo.listBudgets as jest.Mock) = jest.fn().mockResolvedValue({ rows: [mockBudget], total: 1 });
  (repo.updateBudget as jest.Mock) = jest.fn().mockResolvedValue(mockBudget);
  (repo.deleteBudget as jest.Mock) = jest.fn().mockResolvedValue(true);
  (repo.budgetExistsForCategoryAndPeriod as jest.Mock) = jest.fn().mockResolvedValue(false);
  (repo.calculateSpentAmount as jest.Mock) = jest.fn().mockResolvedValue(4000);
});

// ── createBudgetService ──────────────────────────────────────────────────────
describe('createBudgetService', () => {
  const validInput = {
    name: 'Monthly Food Budget',
    categoryId: 'cat-uuid-1',
    amount: 10000,
    period: 'MONTHLY' as const,
    alertThreshold: 80,
    month: 8,
    year: 2026,
  };

  it('creates a category budget and returns mapped DTO with progress status ON_TRACK', async () => {
    const result = await createBudgetService('user-uuid-1', validInput);
    expect(result.id).toBe('budget-uuid-1');
    expect(result.amount).toBe(10000);
    expect(result.spentAmount).toBe(4000);
    expect(result.remainingAmount).toBe(6000);
    expect(result.usagePercentage).toBe(40);
    expect(result.status).toBe('ON_TRACK');
    expect(repo.createBudget).toHaveBeenCalledTimes(1);
  });

  it('creates an overall budget when categoryId is omitted', async () => {
    const overallBudget = { ...mockBudget, category_id: null, category_name: null, name: 'Overall Budget' };
    (repo.createBudget as jest.Mock).mockResolvedValue(overallBudget);

    const result = await createBudgetService('user-uuid-1', { amount: 50000, period: 'MONTHLY' });
    expect(result.categoryId).toBeNull();
    expect(result.amount).toBe(10000);
  });

  it('throws ConflictError when a budget already exists for the category and period', async () => {
    (repo.budgetExistsForCategoryAndPeriod as jest.Mock).mockResolvedValue(true);
    await expect(createBudgetService('user-uuid-1', validInput)).rejects.toThrow(ConflictError);
    expect(repo.createBudget).not.toHaveBeenCalled();
  });

  it('throws ValidationError when category type is income', async () => {
    (repo.getCategory as jest.Mock).mockResolvedValue(mockIncomeCategory);
    await expect(
      createBudgetService('user-uuid-1', { ...validInput, categoryId: 'cat-inc-1' }),
    ).rejects.toThrow(ValidationError);
    expect(repo.createBudget).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when category is not found', async () => {
    (repo.getCategory as jest.Mock).mockResolvedValue(null);
    await expect(
      createBudgetService('user-uuid-1', { ...validInput, categoryId: 'non-existent-cat' }),
    ).rejects.toThrow(NotFoundError);
    expect(repo.createBudget).not.toHaveBeenCalled();
  });
});

// ── getBudgetService ─────────────────────────────────────────────────────────
describe('getBudgetService', () => {
  it('returns budget details with calculated progress', async () => {
    const result = await getBudgetService('budget-uuid-1', 'user-uuid-1');
    expect(result.id).toBe('budget-uuid-1');
    expect(result.spentAmount).toBe(4000);
    expect(result.remainingAmount).toBe(6000);
    expect(repo.findBudgetById).toHaveBeenCalledWith('budget-uuid-1', 'user-uuid-1');
  });

  it('calculates EXCEEDED status when spentAmount exceeds budget amount', async () => {
    (repo.calculateSpentAmount as jest.Mock).mockResolvedValue(12000);
    const result = await getBudgetService('budget-uuid-1', 'user-uuid-1');
    expect(result.status).toBe('EXCEEDED');
    expect(result.remainingAmount).toBe(-2000);
    expect(result.usagePercentage).toBe(120);
  });

  it('calculates NEAR_LIMIT status when usagePercentage crosses alertThreshold', async () => {
    (repo.calculateSpentAmount as jest.Mock).mockResolvedValue(8500);
    const result = await getBudgetService('budget-uuid-1', 'user-uuid-1');
    expect(result.status).toBe('NEAR_LIMIT');
    expect(result.usagePercentage).toBe(85);
  });

  it('throws NotFoundError when budget does not exist', async () => {
    (repo.findBudgetById as jest.Mock).mockResolvedValue(null);
    await expect(getBudgetService('no-such-id', 'user-uuid-1')).rejects.toThrow(NotFoundError);
  });
});

// ── listBudgetsService ───────────────────────────────────────────────────────
describe('listBudgetsService', () => {
  it('returns paginated budget list with calculated spent amounts', async () => {
    const result = await listBudgetsService('user-uuid-1', { page: 1, limit: 20 } as any);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].spentAmount).toBe(4000);
    expect(result.meta.total).toBe(1);
  });

  it('filters budgets by status', async () => {
    (repo.calculateSpentAmount as jest.Mock).mockResolvedValue(11000);
    const result = await listBudgetsService('user-uuid-1', { status: 'EXCEEDED' } as any);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].status).toBe('EXCEEDED');
  });
});

// ── updateBudgetService ───────────────────────────────────────────────────────
describe('updateBudgetService', () => {
  it('updates budget amount and threshold successfully', async () => {
    const updatedMock = { ...mockBudget, amount: '15000.00', alert_threshold: 90 };
    (repo.updateBudget as jest.Mock).mockResolvedValue(updatedMock);

    const result = await updateBudgetService('budget-uuid-1', 'user-uuid-1', {
      amount: 15000,
      alertThreshold: 90,
    });
    expect(result.amount).toBe(15000);
    expect(result.alertThreshold).toBe(90);
  });

  it('throws NotFoundError when budget to update does not exist', async () => {
    (repo.findBudgetById as jest.Mock).mockResolvedValue(null);
    await expect(
      updateBudgetService('no-id', 'user-uuid-1', { amount: 20000 }),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ConflictError when updated period/category conflicts with another active budget', async () => {
    (repo.budgetExistsForCategoryAndPeriod as jest.Mock).mockResolvedValue(true);
    await expect(
      updateBudgetService('budget-uuid-1', 'user-uuid-1', { month: 9 }),
    ).rejects.toThrow(ConflictError);
  });
});

// ── deleteBudgetService ───────────────────────────────────────────────────────
describe('deleteBudgetService', () => {
  it('soft deletes budget successfully', async () => {
    await expect(deleteBudgetService('budget-uuid-1', 'user-uuid-1')).resolves.not.toThrow();
    expect(repo.deleteBudget).toHaveBeenCalledWith('budget-uuid-1', 'user-uuid-1');
  });

  it('throws NotFoundError when budget is not found', async () => {
    (repo.findBudgetById as jest.Mock).mockResolvedValue(null);
    await expect(deleteBudgetService('no-id', 'user-uuid-1')).rejects.toThrow(NotFoundError);
  });
});

// ── getBudgetProgressService ─────────────────────────────────────────────────
describe('getBudgetProgressService', () => {
  it('returns progress dto correctly', async () => {
    const progress = await getBudgetProgressService('budget-uuid-1', 'user-uuid-1');
    expect(progress.budgetId).toBe('budget-uuid-1');
    expect(progress.budgetAmount).toBe(10000);
    expect(progress.spentAmount).toBe(4000);
    expect(progress.remainingAmount).toBe(6000);
    expect(progress.usagePercentage).toBe(40);
    expect(progress.status).toBe('ON_TRACK');
  });
});

// ── getBudgetSummaryService ───────────────────────────────────────────────────
describe('getBudgetSummaryService', () => {
  it('returns aggregate budget summary', async () => {
    const summary = await getBudgetSummaryService('user-uuid-1');
    expect(summary.totalBudgets).toBe(1);
    expect(summary.totalBudgetAmount).toBe(10000);
    expect(summary.totalSpentAmount).toBe(4000);
    expect(summary.totalRemainingAmount).toBe(6000);
    expect(summary.onTrackBudgetsCount).toBe(1);
  });
});
