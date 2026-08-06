import request from 'supertest';
import express from 'express';
import { authRoutes } from '../../src/modules/auth/routes';
import { errorHandler } from '../../src/common/middleware/errorHandler';
import { authRepository } from '../../src/modules/auth/repositories';
import * as utils from '../../src/modules/auth/utils';
import { env } from '../../src/config/env';

jest.mock('../../src/modules/auth/repositories');
jest.mock('../../src/modules/auth/utils', () => ({
  ...jest.requireActual('../../src/modules/auth/utils'),
  hashPassword: jest.fn().mockResolvedValue('hashedpass'),
  comparePassword: jest.fn().mockResolvedValue(true),
  generateAccessToken: jest.fn().mockReturnValue('mocked-access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('mocked-refresh-token'),
  hashRefreshToken: jest.fn().mockReturnValue('mocked-hashed-token'),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: 'uuid-123' }),
}));

// Quick mock app
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use(errorHandler);

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
    (authRepository.findUserById as jest.Mock).mockResolvedValue({
      id: 'uuid-123',
      full_name: 'Test User',
      email: 'test@example.com',
      password_hash: 'hashedpass',
      currency: 'USD',
      timezone: 'UTC'
    });
    (authRepository.createUser as jest.Mock).mockResolvedValue({ id: 'uuid-123' });
    (authRepository.createRefreshToken as jest.Mock).mockResolvedValue({ id: 'token-uuid' });
    (authRepository.findRefreshToken as jest.Mock).mockResolvedValue({
      id: 'token-uuid',
      user_id: 'uuid-123',
      token_hash: 'mocked-hashed-token',
      expires_at: new Date(Date.now() + 10000)
    });
    (authRepository.revokeRefreshToken as jest.Mock).mockResolvedValue(undefined);
    (authRepository.revokeAllUserRefreshTokens as jest.Mock).mockResolvedValue(undefined);
  });

  it('POST /api/v1/auth/register - success', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe('uuid-123');
  });

  it('POST /api/v1/auth/login - success', async () => {
    (authRepository.findUserByEmail as jest.Mock).mockResolvedValue({
      id: 'uuid-123',
      full_name: 'Test User',
      email: 'test@example.com',
      password_hash: 'hashedpass',
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBe('mocked-access-token');
  });

  it('POST /api/v1/auth/refresh - success', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: 'mocked-refresh-token'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBe('mocked-access-token');
  });

  it('POST /api/v1/auth/logout - success', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', 'Bearer mocked-access-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/auth/me - success', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer mocked-access-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('uuid-123');
  });
});
