import request from 'supertest';
import express from 'express';
import { budgetRoutes } from '../../src/modules/budgets/routes';
import { errorHandler } from '../../src/common/middleware/errorHandler';
import { budgetRepository } from '../../src/modules/budgets/repositories';

// ── Mocks ──────────────────────────────────────────────────────────────────────
jest.mock('../../src/modules/budgets/repositories');
jest.mock('../../src/modules/auth/utils', () => ({
  ...jest.requireActual('../../src/modules/auth/utils'),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: 'user-uuid-1' }),
}));

const repo = budgetRepository;

// ── Test App ───────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/budgets', budgetRoutes);
app.use(errorHandler);

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

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

// ── Authentication Guard ────────────────────────────────────────────────────────
describe('Auth guard', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/v1/budgets');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/v1/budgets ───────────────────────────────────────────────────────
describe('POST /api/v1/budgets', () => {
  const validBody = {
    name: 'Monthly Food Budget',
    categoryId: 'cat-uuid-1',
    amount: 10000,
    period: 'MONTHLY',
    alertThreshold: 80,
    month: 8,
    year: 2026,
  };

  it('creates a budget successfully', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .set(AUTH_HEADER)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('budget-uuid-1');
    expect(res.body.data.amount).toBe(10000);
    expect(res.body.data.spentAmount).toBe(4000);
    expect(res.body.data.remainingAmount).toBe(6000);
    expect(res.body.data.status).toBe('ON_TRACK');
  });

  it('returns 400 when amount is missing or negative', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .set(AUTH_HEADER)
      .send({ ...validBody, amount: -100 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when alertThreshold is > 100', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .set(AUTH_HEADER)
      .send({ ...validBody, alertThreshold: 150 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when categoryId is not a valid UUID', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .set(AUTH_HEADER)
      .send({ ...validBody, categoryId: 'not-a-uuid' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when category type is income', async () => {
    (repo.getCategory as jest.Mock).mockResolvedValue(mockIncomeCategory);
    const res = await request(app)
      .post('/api/v1/budgets')
      .set(AUTH_HEADER)
      .send({ ...validBody, categoryId: 'cat-inc-1' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when budget already exists for category and period', async () => {
    (repo.budgetExistsForCategoryAndPeriod as jest.Mock).mockResolvedValue(true);
    const res = await request(app)
      .post('/api/v1/budgets')
      .set(AUTH_HEADER)
      .send(validBody);
    expect(res.status).toBe(409);
  });
});

// ── GET /api/v1/budgets ────────────────────────────────────────────────────────
describe('GET /api/v1/budgets', () => {
  it('returns paginated budget list', async () => {
    const res = await request(app)
      .get('/api/v1/budgets')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('passes query filters to repository', async () => {
    await request(app)
      .get('/api/v1/budgets?period=MONTHLY&month=8&year=2026')
      .set(AUTH_HEADER);

    expect(repo.listBudgets).toHaveBeenCalledWith(
      expect.objectContaining({ period: 'MONTHLY', month: 8, year: 2026 }),
    );
  });
});

// ── GET /api/v1/budgets/summary ────────────────────────────────────────────────
describe('GET /api/v1/budgets/summary', () => {
  it('returns overall budget summary', async () => {
    const res = await request(app)
      .get('/api/v1/budgets/summary')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalBudgetAmount).toBe(10000);
    expect(res.body.data.totalSpentAmount).toBe(4000);
  });
});

// ── GET /api/v1/budgets/:id ───────────────────────────────────────────────────
describe('GET /api/v1/budgets/:id', () => {
  it('returns budget details', async () => {
    const res = await request(app)
      .get('/api/v1/budgets/budget-uuid-1')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('budget-uuid-1');
  });

  it('returns 404 when budget is not found', async () => {
    (repo.findBudgetById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .get('/api/v1/budgets/00000000-0000-0000-0000-000000000000')
      .set(AUTH_HEADER);
    expect(res.status).toBe(404);
  });

  it('returns 400 when id is not a UUID', async () => {
    const res = await request(app)
      .get('/api/v1/budgets/invalid-id')
      .set(AUTH_HEADER);
    expect(res.status).toBe(400);
  });
});

// ── GET /api/v1/budgets/:id/progress ──────────────────────────────────────────
describe('GET /api/v1/budgets/:id/progress', () => {
  it('returns progress details', async () => {
    const res = await request(app)
      .get('/api/v1/budgets/budget-uuid-1/progress')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.budgetId).toBe('budget-uuid-1');
    expect(res.body.data.spentAmount).toBe(4000);
    expect(res.body.data.remainingAmount).toBe(6000);
    expect(res.body.data.status).toBe('ON_TRACK');
  });
});

// ── PATCH /api/v1/budgets/:id ──────────────────────────────────────────────────
describe('PATCH /api/v1/budgets/:id', () => {
  it('updates budget details successfully', async () => {
    const res = await request(app)
      .patch('/api/v1/budgets/budget-uuid-1')
      .set(AUTH_HEADER)
      .send({ amount: 15000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when budget is not found', async () => {
    (repo.findBudgetById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/v1/budgets/00000000-0000-0000-0000-000000000000')
      .set(AUTH_HEADER)
      .send({ amount: 15000 });
    expect(res.status).toBe(404);
  });

  it('returns 409 when update creates period/category conflict', async () => {
    (repo.budgetExistsForCategoryAndPeriod as jest.Mock).mockResolvedValue(true);
    const res = await request(app)
      .patch('/api/v1/budgets/budget-uuid-1')
      .set(AUTH_HEADER)
      .send({ month: 9 });
    expect(res.status).toBe(409);
  });
});

// ── DELETE /api/v1/budgets/:id ─────────────────────────────────────────────────
describe('DELETE /api/v1/budgets/:id', () => {
  it('soft deletes budget successfully', async () => {
    const res = await request(app)
      .delete('/api/v1/budgets/budget-uuid-1')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when budget is not found', async () => {
    (repo.findBudgetById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .delete('/api/v1/budgets/00000000-0000-0000-0000-000000000000')
      .set(AUTH_HEADER);
    expect(res.status).toBe(404);
  });
});
