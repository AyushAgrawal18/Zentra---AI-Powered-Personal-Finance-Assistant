import request from 'supertest';
import express from 'express';
import { dashboardRoutes } from '../../src/modules/dashboard/routes';
import { errorHandler } from '../../src/common/middleware/errorHandler';
import { getDashboardService } from '../../src/modules/dashboard/services/get-dashboard.service';

jest.mock('../../src/modules/dashboard/services/get-dashboard.service');
jest.mock('../../src/modules/auth/utils', () => ({
  ...jest.requireActual('../../src/modules/auth/utils'),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: 'user-uuid-1' }),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/dashboard', dashboardRoutes);
app.use(errorHandler);

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

const mockDashboard = {
  summary: { balance: 30000, income: 10000, expense: 4000, savings: 6000 },
  budgets: [],
  goals: [],
  recentTransactions: [],
  analytics: { incomeVsExpense: { income: 10000, expense: 4000 } },
  aiInsights: [],
  notifications: [],
};

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDashboardService as jest.Mock).mockResolvedValue(mockDashboard);
  });

  describe('GET /api/v1/dashboard', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/dashboard');
      expect(res.status).toBe(401);
    });

    it('returns 200 and dashboard data when authenticated', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard')
        .set(AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.balance).toBe(30000);
      expect(getDashboardService).toHaveBeenCalledWith('user-uuid-1', {});
    });

    it('parses query parameters', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard?month=8&year=2026')
        .set(AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(getDashboardService).toHaveBeenCalledWith('user-uuid-1', { month: 8, year: 2026 });
    });

    it('returns 400 when invalid query parameters are provided', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard?month=invalid')
        .set(AUTH_HEADER);

      expect(res.status).toBe(400); // Zod validation should catch this
    });
  });

  describe('GET /api/v1/dashboard/refresh', () => {
    it('returns 200 and refreshes dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/refresh')
        .set(AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Dashboard cache refreshed successfully');
    });
  });
});
