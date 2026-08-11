import request from 'supertest';
import express from 'express';
import { goalRoutes } from '../../src/modules/goals/routes';
import { errorHandler } from '../../src/common/middleware/errorHandler';
import { goalRepository } from '../../src/modules/goals/repositories';

// ── Mocks ──────────────────────────────────────────────────────────────────────
jest.mock('../../src/modules/goals/repositories');
jest.mock('../../src/modules/auth/utils', () => ({
  ...jest.requireActual('../../src/modules/auth/utils'),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: 'user-uuid-1' }),
}));

const repo = goalRepository;

// ── Test App ───────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/goals', goalRoutes);
app.use(errorHandler);

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

const mockGoal = {
  id: 'goal-uuid-1',
  user_id: 'user-uuid-1',
  name: 'New Laptop',
  description: 'For work and development.',
  target_amount: '120000.00',
  current_amount: '35000.00',
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

beforeEach(() => {
  jest.clearAllMocks();
  (repo.createGoal as jest.Mock) = jest.fn().mockResolvedValue(mockGoal);
  (repo.findGoalById as jest.Mock) = jest.fn().mockResolvedValue(mockGoal);
  (repo.listGoals as jest.Mock) = jest.fn().mockResolvedValue({ rows: [mockGoal], total: 1 });
  (repo.updateGoal as jest.Mock) = jest.fn().mockResolvedValue(mockGoal);
  (repo.deleteGoal as jest.Mock) = jest.fn().mockResolvedValue(true);
  (repo.addContribution as jest.Mock) = jest.fn().mockResolvedValue({
    ...mockGoal,
    current_amount: '40000.00',
  });
  (repo.nameExistsForUser as jest.Mock) = jest.fn().mockResolvedValue(false);
});

// ── Auth Guard ─────────────────────────────────────────────────────────────────
describe('Auth guard', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/v1/goals');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/v1/goals ─────────────────────────────────────────────────────────
describe('POST /api/v1/goals', () => {
  const validBody = {
    name: 'New Laptop',
    targetAmount: 120000,
    targetDate: '2027-03-31',
    notes: 'For work and development.',
  };

  it('creates a goal successfully', async () => {
    const res = await request(app)
      .post('/api/v1/goals')
      .set(AUTH_HEADER)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('goal-uuid-1');
    expect(res.body.data.name).toBe('New Laptop');
    expect(res.body.data.targetAmount).toBe(120000);
    expect(res.body.data.currentAmount).toBe(35000);
    expect(res.body.data.remainingAmount).toBe(85000);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/v1/goals')
      .set(AUTH_HEADER)
      .send({ targetAmount: 10000, targetDate: '2027-03-31' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when targetAmount is zero or negative', async () => {
    const res = await request(app)
      .post('/api/v1/goals')
      .set(AUTH_HEADER)
      .send({ ...validBody, targetAmount: -500 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when targetDate is in the past', async () => {
    const res = await request(app)
      .post('/api/v1/goals')
      .set(AUTH_HEADER)
      .send({ ...validBody, targetDate: '2020-01-01' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when goal name already exists', async () => {
    (repo.nameExistsForUser as jest.Mock).mockResolvedValue(true);
    const res = await request(app)
      .post('/api/v1/goals')
      .set(AUTH_HEADER)
      .send(validBody);
    expect(res.status).toBe(409);
  });
});

// ── GET /api/v1/goals ──────────────────────────────────────────────────────────
describe('GET /api/v1/goals', () => {
  it('returns paginated list of goals', async () => {
    const res = await request(app)
      .get('/api/v1/goals')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('passes query filters to repository', async () => {
    await request(app)
      .get('/api/v1/goals?status=ACTIVE&search=Laptop&page=1&limit=10')
      .set(AUTH_HEADER);

    expect(repo.listGoals).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ACTIVE', search: 'Laptop', page: 1, limit: 10 }),
    );
  });
});

// ── GET /api/v1/goals/:id ─────────────────────────────────────────────────────
describe('GET /api/v1/goals/:id', () => {
  it('returns goal details', async () => {
    const res = await request(app)
      .get('/api/v1/goals/goal-uuid-1')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('goal-uuid-1');
  });

  it('returns 404 when goal is not found', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .get('/api/v1/goals/00000000-0000-0000-0000-000000000000')
      .set(AUTH_HEADER);
    expect(res.status).toBe(404);
  });

  it('returns 400 when id is not a UUID', async () => {
    const res = await request(app)
      .get('/api/v1/goals/not-a-uuid')
      .set(AUTH_HEADER);
    expect(res.status).toBe(400);
  });
});

// ── PATCH /api/v1/goals/:id ────────────────────────────────────────────────────
describe('PATCH /api/v1/goals/:id', () => {
  it('updates goal successfully', async () => {
    const res = await request(app)
      .patch('/api/v1/goals/goal-uuid-1')
      .set(AUTH_HEADER)
      .send({ targetAmount: 150000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when goal to update is not found', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/v1/goals/00000000-0000-0000-0000-000000000000')
      .set(AUTH_HEADER)
      .send({ targetAmount: 150000 });
    expect(res.status).toBe(404);
  });

  it('returns 409 when updating name to an existing goal name', async () => {
    (repo.nameExistsForUser as jest.Mock).mockResolvedValue(true);
    const res = await request(app)
      .patch('/api/v1/goals/goal-uuid-1')
      .set(AUTH_HEADER)
      .send({ name: 'Duplicate Name' });
    expect(res.status).toBe(409);
  });
});

// ── DELETE /api/v1/goals/:id ───────────────────────────────────────────────────
describe('DELETE /api/v1/goals/:id', () => {
  it('soft deletes goal successfully', async () => {
    const res = await request(app)
      .delete('/api/v1/goals/goal-uuid-1')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when goal is not found', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .delete('/api/v1/goals/00000000-0000-0000-0000-000000000000')
      .set(AUTH_HEADER);
    expect(res.status).toBe(404);
  });
});

// ── POST /api/v1/goals/:id/contribute ──────────────────────────────────────────
describe('POST /api/v1/goals/:id/contribute', () => {
  it('adds contribution successfully', async () => {
    const res = await request(app)
      .post('/api/v1/goals/goal-uuid-1/contribute')
      .set(AUTH_HEADER)
      .send({ amount: 5000, notes: 'Monthly savings' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentAmount).toBe(40000);
  });

  it('returns 400 when contribution amount is <= 0', async () => {
    const res = await request(app)
      .post('/api/v1/goals/goal-uuid-1/contribute')
      .set(AUTH_HEADER)
      .send({ amount: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when goal is already completed', async () => {
    (repo.findGoalById as jest.Mock).mockResolvedValue(mockCompletedGoal);
    const res = await request(app)
      .post('/api/v1/goals/goal-uuid-1/contribute')
      .set(AUTH_HEADER)
      .send({ amount: 5000 });
    expect(res.status).toBe(400);
  });
});

// ── GET /api/v1/goals/:id/progress ─────────────────────────────────────────────
describe('GET /api/v1/goals/:id/progress', () => {
  it('returns goal progress', async () => {
    const res = await request(app)
      .get('/api/v1/goals/goal-uuid-1/progress')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.goalId).toBe('goal-uuid-1');
    expect(res.body.data.targetAmount).toBe(120000);
    expect(res.body.data.currentAmount).toBe(35000);
    expect(res.body.data.remainingAmount).toBe(85000);
  });
});
