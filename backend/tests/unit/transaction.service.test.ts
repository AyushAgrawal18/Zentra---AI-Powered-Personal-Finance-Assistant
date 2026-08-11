import { transactionRepository } from '../../src/modules/transactions/repositories';
import { createTransactionService } from '../../src/modules/transactions/services/create-transaction.service';
import { getTransactionService } from '../../src/modules/transactions/services/get-transaction.service';
import { listTransactionsService } from '../../src/modules/transactions/services/list-transactions.service';
import { updateTransactionService } from '../../src/modules/transactions/services/update-transaction.service';
import { deleteTransactionService } from '../../src/modules/transactions/services/delete-transaction.service';
import { balanceService } from '../../src/modules/transactions/services/balance.service';
import { summaryService } from '../../src/modules/transactions/services/summary.service';
import { NotFoundError } from '../../src/common/errors';

// ── Mock the repository ────────────────────────────────────────────────────────
jest.mock('../../src/modules/transactions/repositories');

const repo = transactionRepository;

const mockTransaction = {
  id: 'txn-uuid-1',
  user_id: 'user-uuid-1',
  category_id: 'cat-uuid-1',
  amount: '350.00',
  transaction_type: 'expense',
  payment_method: 'upi',
  source: 'manual',
  merchant_name: 'Starbucks',
  description: null,
  notes: 'Coffee',
  transaction_date: new Date('2026-08-01T00:00:00.000Z'),
  attachment_url: null,
  created_at: new Date('2026-08-01T10:00:00.000Z'),
  updated_at: new Date('2026-08-01T10:00:00.000Z'),
  deleted_at: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  (repo.categoryExists as jest.Mock) = jest.fn().mockResolvedValue(true);
  (repo.createTransaction as jest.Mock) = jest.fn().mockResolvedValue(mockTransaction);
  (repo.findTransactionById as jest.Mock) = jest.fn().mockResolvedValue(mockTransaction);
  (repo.listTransactions as jest.Mock) = jest.fn().mockResolvedValue({ rows: [mockTransaction], total: 1 });
  (repo.updateTransaction as jest.Mock) = jest.fn().mockResolvedValue(mockTransaction);
  (repo.deleteTransaction as jest.Mock) = jest.fn().mockResolvedValue(true);
  (repo.calculateBalance as jest.Mock) = jest.fn().mockResolvedValue({ income: 1000, expense: 350, balance: 650 });
  (repo.monthlySummary as jest.Mock) = jest.fn().mockResolvedValue({
    month: 8, year: 2026, totalIncome: 1000, totalExpense: 350, netBalance: 650,
    transactionCount: 5, categoryBreakdown: [],
  });
});

// ── createTransactionService ───────────────────────────────────────────────────
describe('createTransactionService', () => {
  const validInput = {
    amount: 350,
    transactionType: 'expense' as const,
    categoryId: 'cat-uuid-1',
    merchantName: 'Starbucks',
    paymentMethod: 'upi' as const,
    source: 'manual' as const,
    transactionDate: '2026-08-01',
    notes: 'Coffee',
  };

  it('creates a transaction and returns mapped DTO', async () => {
    const result = await createTransactionService('user-uuid-1', validInput);
    expect(result.id).toBe('txn-uuid-1');
    expect(result.amount).toBe(350);
    expect(result.merchantName).toBe('Starbucks');
    expect(repo.createTransaction).toHaveBeenCalledTimes(1);
  });

  it('validates category existence before creating', async () => {
    (repo.categoryExists as jest.Mock).mockResolvedValue(false);
    await expect(createTransactionService('user-uuid-1', validInput)).rejects.toThrow(NotFoundError);
    expect(repo.createTransaction).not.toHaveBeenCalled();
  });
});

// ── getTransactionService ──────────────────────────────────────────────────────
describe('getTransactionService', () => {
  it('returns the transaction when it exists', async () => {
    const result = await getTransactionService('txn-uuid-1', 'user-uuid-1');
    expect(result.id).toBe('txn-uuid-1');
    expect(repo.findTransactionById).toHaveBeenCalledWith('txn-uuid-1', 'user-uuid-1');
  });

  it('throws NotFoundError when transaction does not exist', async () => {
    (repo.findTransactionById as jest.Mock).mockResolvedValue(null);
    await expect(getTransactionService('no-such-id', 'user-uuid-1')).rejects.toThrow(NotFoundError);
  });

  it('throws NotFoundError when transaction belongs to another user', async () => {
    (repo.findTransactionById as jest.Mock).mockResolvedValue(null);
    await expect(getTransactionService('txn-uuid-1', 'other-user')).rejects.toThrow(NotFoundError);
  });
});

// ── listTransactionsService ────────────────────────────────────────────────────
describe('listTransactionsService', () => {
  it('returns paginated transaction list', async () => {
    const result = await listTransactionsService('user-uuid-1', { page: 1, limit: 20 } as any);
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });

  it('passes search, filter and pagination params to repository', async () => {
    await listTransactionsService('user-uuid-1', {
      page: 2, limit: 10, search: 'coffee', type: 'expense', categoryId: 'cat-uuid-1',
    } as any);
    expect(repo.listTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 10, search: 'coffee', type: 'expense' }),
    );
  });

  it('returns empty result when no transactions found', async () => {
    (repo.listTransactions as jest.Mock).mockResolvedValue({ rows: [], total: 0 });
    const result = await listTransactionsService('user-uuid-1', {} as any);
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });
});

// ── updateTransactionService ───────────────────────────────────────────────────
describe('updateTransactionService', () => {
  it('updates and returns the updated transaction', async () => {
    const result = await updateTransactionService('txn-uuid-1', 'user-uuid-1', { notes: 'Updated' });
    expect(result.id).toBe('txn-uuid-1');
    expect(repo.updateTransaction).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError when transaction does not exist', async () => {
    (repo.findTransactionById as jest.Mock).mockResolvedValue(null);
    await expect(updateTransactionService('no-id', 'user-uuid-1', { notes: 'x' })).rejects.toThrow(NotFoundError);
  });

  it('validates new categoryId if provided', async () => {
    (repo.categoryExists as jest.Mock).mockResolvedValue(false);
    await expect(updateTransactionService('txn-uuid-1', 'user-uuid-1', { categoryId: 'bad-cat' })).rejects.toThrow(NotFoundError);
    expect(repo.updateTransaction).not.toHaveBeenCalled();
  });
});

// ── deleteTransactionService ───────────────────────────────────────────────────
describe('deleteTransactionService', () => {
  it('soft-deletes the transaction', async () => {
    await expect(deleteTransactionService('txn-uuid-1', 'user-uuid-1')).resolves.not.toThrow();
    expect(repo.deleteTransaction).toHaveBeenCalledWith('txn-uuid-1', 'user-uuid-1');
  });

  it('throws NotFoundError when transaction does not exist or belongs to another user', async () => {
    (repo.deleteTransaction as jest.Mock).mockResolvedValue(false);
    await expect(deleteTransactionService('no-id', 'user-uuid-1')).rejects.toThrow(NotFoundError);
  });
});

// ── balanceService ─────────────────────────────────────────────────────────────
describe('balanceService', () => {
  it('returns income, expense, and net balance', async () => {
    const result = await balanceService('user-uuid-1');
    expect(result.income).toBe(1000);
    expect(result.expense).toBe(350);
    expect(result.balance).toBe(650);
  });
});

// ── summaryService ─────────────────────────────────────────────────────────────
describe('summaryService', () => {
  it('returns monthly summary for the given month and year', async () => {
    const result = await summaryService('user-uuid-1', 8, 2026);
    expect(result.month).toBe(8);
    expect(result.year).toBe(2026);
    expect(result.totalIncome).toBe(1000);
    expect(result.totalExpense).toBe(350);
    expect(result.netBalance).toBe(650);
    expect(repo.monthlySummary).toHaveBeenCalledWith('user-uuid-1', 8, 2026);
  });
});
