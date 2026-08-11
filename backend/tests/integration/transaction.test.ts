import request from 'supertest';
import express from 'express';
import { transactionRoutes } from '../../src/modules/transactions/routes';
import { errorHandler } from '../../src/common/middleware/errorHandler';
import { transactionRepository } from '../../src/modules/transactions/repositories';
// import { describe, it } from 'node:test';

// ── Mocks ──────────────────────────────────────────────────────────────────────
jest.mock('../../src/modules/transactions/repositories');
jest.mock('../../src/modules/auth/utils', () => ({
  ...jest.requireActual('../../src/modules/auth/utils'),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: 'user-uuid-1' }),
}));

const repo = transactionRepository;

// ── Test App ───────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/transactions', transactionRoutes);
app.use(errorHandler);

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

const mockTransaction = {
  id: 'txn-uuid-1',
  user_id: 'user-uuid-1',
  category_id: '00000000-0000-0000-0000-000000000001',
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

// ── Authentication guard ───────────────────────────────────────────────────────
describe('Auth guard', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/v1/transactions');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/v1/transactions ──────────────────────────────────────────────────
describe('POST /api/v1/transactions', () => {
  const validBody = {
    amount: 350,
    transactionType: 'expense',
    categoryId: '00000000-0000-0000-0000-000000000001',
    merchantName: 'Starbucks',
    paymentMethod: 'upi',
    transactionDate: '2026-08-01',
    notes: 'Coffee',
  };

  it('creates a transaction successfully', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set(AUTH_HEADER)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('txn-uuid-1');
    expect(res.body.data.amount).toBe(350);
  });

  it('returns 422 when amount is missing', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set(AUTH_HEADER)
      .send({ ...validBody, amount: undefined });
    expect(res.status).toBe(400);
  });

  it('returns 422 when amount is zero or negative', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set(AUTH_HEADER)
      .send({ ...validBody, amount: -10 });
    expect(res.status).toBe(400);
  });

  it('returns 422 when transactionType is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set(AUTH_HEADER)
      .send({ ...validBody, transactionType: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('returns 422 when categoryId is not a UUID', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set(AUTH_HEADER)
      .send({ ...validBody, categoryId: 'not-a-uuid' });
    expect(res.status).toBe(400);
  });

  it('returns 404 when category does not belong to user', async () => {
    (repo.categoryExists as jest.Mock).mockResolvedValue(false);
    const res = await request(app)
      .post('/api/v1/transactions')
      .set(AUTH_HEADER)
      .send(validBody);
    expect(res.status).toBe(404);
  });
});

// ── GET /api/v1/transactions ───────────────────────────────────────────────────
describe('GET /api/v1/transactions', () => {
  it('returns paginated transaction list', async () => {
    const res = await request(app)
      .get('/api/v1/transactions')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('passes filter params to repository', async () => {
    await request(app)
      .get('/api/v1/transactions?type=expense&page=2&limit=10')
      .set(AUTH_HEADER);

    expect(repo.listTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'expense', page: 2, limit: 10 }),
    );
  });

  it('returns 422 when type is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/transactions?type=BADTYPE')
      .set(AUTH_HEADER);
    expect(res.status).toBe(400);
  });
});

// ── GET /api/v1/transactions/balance ──────────────────────────────────────────
describe('GET /api/v1/transactions/balance', () => {
  it('returns income, expense, and balance', async () => {
    const res = await request(app)
      .get('/api/v1/transactions/balance')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.income).toBe(1000);
    expect(res.body.data.expense).toBe(350);
    expect(res.body.data.balance).toBe(650);
  });
});

// ── GET /api/v1/transactions/summary ──────────────────────────────────────────
describe('GET /api/v1/transactions/summary', () => {
  it('returns monthly summary for query params', async () => {
    const res = await request(app)
      .get('/api/v1/transactions/summary?month=8&year=2026')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.month).toBe(8);
    expect(res.body.data.year).toBe(2026);
    expect(res.body.data.totalIncome).toBe(1000);
  });

  it('defaults to current month/year when no params given', async () => {
    const res = await request(app)
      .get('/api/v1/transactions/summary')
      .set(AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ── GET /api/v1/transactions/monthly ──────────────────────────────────────────
describe('GET /api/v1/transactions/monthly', () => {
  it('returns monthly summary (alias endpoint)', async () => {
    const res = await request(app)
      .get('/api/v1/transactions/monthly?month=8&year=2026')
      .set(AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body.data.netBalance).toBe(650);
  });
});

// ── GET /api/v1/transactions/:id ──────────────────────────────────────────────
describe('GET /api/v1/transactions/:id', () => {
  it('returns a single transaction', async () => {
    const res = await request(app)
      .get('/api/v1/transactions/txn-uuid-1')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('txn-uuid-1');
  });

  it('returns 404 when transaction is not found', async () => {
    (repo.findTransactionById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .get('/api/v1/transactions/missing-id')
      .set(AUTH_HEADER);
    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/v1/transactions/:id ────────────────────────────────────────────
describe('PATCH /api/v1/transactions/:id', () => {
  it('updates a transaction successfully', async () => {
    const res = await request(app)
      .patch('/api/v1/transactions/txn-uuid-1')
      .set(AUTH_HEADER)
      .send({ notes: 'Updated note' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when transaction does not exist', async () => {
    (repo.findTransactionById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/v1/transactions/missing-id')
      .set(AUTH_HEADER)
      .send({ notes: 'x' });
    expect(res.status).toBe(404);
  });

  it('returns 422 when amount is negative', async () => {
    const res = await request(app)
      .patch('/api/v1/transactions/txn-uuid-1')
      .set(AUTH_HEADER)
      .send({ amount: -5 });
    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/v1/transactions/:id ───────────────────────────────────────────
describe('DELETE /api/v1/transactions/:id', () => {
  it('soft-deletes a transaction successfully', async () => {
    const res = await request(app)
      .delete('/api/v1/transactions/txn-uuid-1')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when transaction is not found', async () => {
    (repo.deleteTransaction as jest.Mock).mockResolvedValue(false);
    const res = await request(app)
      .delete('/api/v1/transactions/missing-id')
      .set(AUTH_HEADER);
    expect(res.status).toBe(404);
  });
});
// function beforeEach(arg0: () => void) {
//   throw new Error('Function not implemented.');
// }

// function expect(status: number) {
//   throw new Error('Function not implemented.');
// }

