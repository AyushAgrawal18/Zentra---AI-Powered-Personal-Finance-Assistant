import { getSummaryService, getIncomeExpenseService, getCategoriesService } from '../../src/modules/analytics/services';
import { analyticsRepository } from '../../src/modules/analytics/repositories';

jest.mock('../../src/modules/analytics/repositories');

describe('Analytics Services', () => {
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummaryService', () => {
    it('calculates average spending and net savings correctly', async () => {
      (analyticsRepository.getSummary as jest.Mock).mockResolvedValue({
        transactionCount: 10,
        expenseTransactionCount: 4,
        totalIncome: 5000,
        totalExpense: 2000,
      });

      const result = await getSummaryService(userId, {});
      
      expect(result.netSavings).toBe(3000); // 5000 - 2000
      expect(result.averageSpending).toBe(500); // 2000 / 4 expense transactions
      expect(analyticsRepository.getSummary).toHaveBeenCalledWith(userId, undefined, undefined, undefined, undefined);
    });

    it('handles zero transactions gracefully', async () => {
      (analyticsRepository.getSummary as jest.Mock).mockResolvedValue({
        transactionCount: 0,
        expenseTransactionCount: 0,
        totalIncome: 0,
        totalExpense: 0,
      });

      const result = await getSummaryService(userId, {});
      expect(result.averageSpending).toBe(0);
      expect(result.netSavings).toBe(0);
    });
  });

  describe('getIncomeExpenseService', () => {
    it('maps summary values properly', async () => {
      (analyticsRepository.getSummary as jest.Mock).mockResolvedValue({
        transactionCount: 5,
        expenseTransactionCount: 2,
        totalIncome: 1000,
        totalExpense: 400,
      });

      const result = await getIncomeExpenseService(userId, {});
      
      expect(result.income).toBe(1000);
      expect(result.expense).toBe(400);
      expect(result.savings).toBe(600);
    });
  });

  describe('getCategoriesService', () => {
    it('calculates percentages correctly', async () => {
      (analyticsRepository.getCategoryBreakdown as jest.Mock).mockResolvedValue([
        { category: 'Food', amount: 300 },
        { category: 'Transport', amount: 100 },
      ]);

      const result = await getCategoriesService(userId, {});
      
      expect(result).toHaveLength(2);
      expect(result[0].percentage).toBe(75); // 300 / 400
      expect(result[1].percentage).toBe(25); // 100 / 400
    });

    it('returns zero percentage when total is zero', async () => {
      (analyticsRepository.getCategoryBreakdown as jest.Mock).mockResolvedValue([
        { category: 'Food', amount: 0 },
      ]);

      const result = await getCategoriesService(userId, {});
      expect(result[0].percentage).toBe(0);
    });
  });
});
