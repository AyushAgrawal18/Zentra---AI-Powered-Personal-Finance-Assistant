import { getDashboardService } from '../../src/modules/dashboard/services/get-dashboard.service';
import { transactionRepository } from '../../src/modules/transactions/repositories';
import { listBudgetsService } from '../../src/modules/budgets/services/list-budgets.service';
import { listGoalsService } from '../../src/modules/goals/services/list-goals.service';
import { listTransactionsService } from '../../src/modules/transactions/services/list-transactions.service';
import { getSpendingService, getCashFlowService } from '../../src/modules/analytics/services';

jest.mock('../../src/modules/transactions/repositories');
jest.mock('../../src/modules/budgets/services/list-budgets.service');
jest.mock('../../src/modules/goals/services/list-goals.service');
jest.mock('../../src/modules/transactions/services/list-transactions.service');
jest.mock('../../src/modules/analytics/services');

describe('getDashboardService', () => {
  const userId = 'user-uuid-1';

  beforeEach(() => {
    jest.clearAllMocks();

    (transactionRepository.calculateBalance as jest.Mock).mockResolvedValue({
      income: 50000,
      expense: 20000,
      balance: 30000,
    });

    (transactionRepository.monthlySummary as jest.Mock).mockResolvedValue({
      month: 8,
      year: 2026,
      totalIncome: 10000,
      totalExpense: 4000,
      netBalance: 6000,
      transactionCount: 5,
      categoryBreakdown: [],
    });

    (listBudgetsService as jest.Mock).mockResolvedValue({
      data: [{ id: 'budget-1' }],
      meta: { total: 1 },
    });

    (listGoalsService as jest.Mock).mockResolvedValue({
      data: [{ id: 'goal-1' }],
      meta: { total: 1 },
    });

    (listTransactionsService as jest.Mock).mockResolvedValue({
      data: [{ id: 'tx-1' }],
      meta: { total: 1 },
    });

    (getSpendingService as jest.Mock).mockResolvedValue([]);
    (getCashFlowService as jest.Mock).mockResolvedValue([]);
  });

  it('fetches dashboard data from multiple modules', async () => {
    const result = await getDashboardService(userId, { month: 8, year: 2026 });

    expect(result.summary.balance).toBe(30000);
    expect(result.summary.income).toBe(10000);
    expect(result.summary.expense).toBe(4000);
    expect(result.summary.savings).toBe(6000);

    expect(result.budgets).toHaveLength(1);
    expect(result.goals).toHaveLength(1);
    expect(result.recentTransactions).toHaveLength(1);

    expect(transactionRepository.calculateBalance).toHaveBeenCalledWith(userId);
    expect(transactionRepository.monthlySummary).toHaveBeenCalledWith(userId, 8, 2026);
    expect(listBudgetsService).toHaveBeenCalledWith(userId, expect.any(Object));
    expect(listGoalsService).toHaveBeenCalledWith(userId, expect.any(Object));
    expect(listTransactionsService).toHaveBeenCalledWith(userId, expect.any(Object));
    expect(getSpendingService).toHaveBeenCalledWith(userId, expect.any(Object));
    expect(getCashFlowService).toHaveBeenCalledWith(userId, expect.any(Object));
  });

  it('uses current month and year if not provided', async () => {
    const result = await getDashboardService(userId, {});
    const now = new Date();
    
    expect(transactionRepository.monthlySummary).toHaveBeenCalledWith(userId, now.getMonth() + 1, now.getFullYear());
  });
});

