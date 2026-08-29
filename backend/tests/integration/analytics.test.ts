import request from 'supertest';
import express from 'express';
import { analyticsRoutes } from '../../src/modules/analytics/routes';
import { errorHandler } from '../../src/common/middleware/errorHandler';
import { analyticsRepository } from '../../src/modules/analytics/repositories';

jest.mock('../../src/modules/analytics/repositories');
jest.mock('../../src/modules/auth/utils', () => ({
  ...jest.requireActual('../../src/modules/auth/utils'),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: 'user-uuid-1' }),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/analytics', analyticsRoutes);
app.use(errorHandler);

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

describe('Analytics Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/analytics/summary', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/analytics/summary');
      expect(res.status).toBe(401);
    });

    it('returns 200 and formatted summary data', async () => {
      (analyticsRepository.getSummary as jest.Mock).mockResolvedValue({
        transactionCount: 10,
        totalIncome: 1000,
        totalExpense: 300,
      });

      const res = await request(app)
        .get('/api/v1/analytics/summary?from=2026-01-01&to=2026-12-31')
        .set(AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.netSavings).toBe(700);
      expect(res.body.data.averageSpending).toBe(30);
      expect(analyticsRepository.getSummary).toHaveBeenCalledWith('user-uuid-1', '2026-01-01', '2026-12-31');
    });

    it('returns 422 if dates are invalid order', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/summary?from=2026-12-31&to=2026-01-01')
        .set(AUTH_HEADER);

      expect(res.status).toBe(422); // Handled by Zod dateRangeSchema refine
    });
  });

  describe('GET /api/v1/analytics/spending', () => {
    it('returns 200 and trend data', async () => {
      (analyticsRepository.getTrends as jest.Mock).mockResolvedValue([
        { label: '2026-08-01T00:00:00.000Z', income: 500, expense: 200 },
      ]);

      const res = await request(app)
        .get('/api/v1/analytics/spending?period=monthly')
        .set(AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].income).toBe(500);
      expect(analyticsRepository.getTrends).toHaveBeenCalledWith('user-uuid-1', 'monthly', undefined, undefined);
    });

    it('returns 422 for invalid period', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/spending?period=hourly')
        .set(AUTH_HEADER);
      
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/analytics/cash-flow', () => {
    it('returns 200 and cash flow data with balances', async () => {
      (analyticsRepository.getOpeningBalance as jest.Mock).mockResolvedValue(1000);
      (analyticsRepository.getTrends as jest.Mock).mockResolvedValue([
        { label: '2026-08-01', income: 500, expense: 200 },
        { label: '2026-09-01', income: 0, expense: 300 },
      ]);

      const res = await request(app)
        .get('/api/v1/analytics/cash-flow?from=2026-08-01')
        .set(AUTH_HEADER);

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data).toHaveLength(2);
      expect(data[0].openingBalance).toBe(1000); // from db
      expect(data[0].closingBalance).toBe(1300); // 1000 + 500 - 200
      expect(data[1].openingBalance).toBe(1300); // from prev closing
      expect(data[1].closingBalance).toBe(1000); // 1300 + 0 - 300
    });
  });

});
