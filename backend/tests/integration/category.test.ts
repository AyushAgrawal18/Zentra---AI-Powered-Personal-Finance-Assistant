import request from 'supertest';
import express from 'express';
import { categoryRoutes } from '../../src/modules/categories/routes';
import { errorHandler } from '../../src/common/middleware/errorHandler';
import { categoryRepository } from '../../src/modules/categories/repositories';

// ── Mocks ──────────────────────────────────────────────────────────────────────
jest.mock('../../src/modules/categories/repositories');
jest.mock('../../src/modules/auth/utils', () => ({
  ...jest.requireActual('../../src/modules/auth/utils'),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: 'user-uuid-1' }),
}));

const repo = categoryRepository;

// ── Test App ───────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/categories', categoryRoutes);
app.use(errorHandler);

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

const mockCategory = {
  id: '11111111-1111-4111-8111-111111111111',
  user_id: 'user-uuid-1',
  name: 'Food',
  type: 'expense',
  icon: 'utensils',
  color: '#FF9800',
  is_system: false,
  created_at: new Date('2026-08-01T10:00:00.000Z'),
  updated_at: new Date('2026-08-01T10:00:00.000Z'),
  deleted_at: null,
};

const mockSystemCategory = {
  ...mockCategory,
  id: '22222222-2222-4222-8222-222222222222',
  user_id: null,
  name: 'Salary',
  type: 'income',
  is_system: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  (repo.findCategoryById as jest.Mock) = jest.fn().mockResolvedValue(mockCategory);
  (repo.createCategory as jest.Mock) = jest.fn().mockResolvedValue(mockCategory);
  (repo.listCategories as jest.Mock) = jest.fn().mockResolvedValue({ rows: [mockCategory], total: 1 });
  (repo.updateCategory as jest.Mock) = jest.fn().mockResolvedValue(mockCategory);
  (repo.deleteCategory as jest.Mock) = jest.fn().mockResolvedValue(true);
  (repo.nameExistsForUser as jest.Mock) = jest.fn().mockResolvedValue(false);
  (repo.hasTransactions as jest.Mock) = jest.fn().mockResolvedValue(false);
});

// ── Authentication guard ───────────────────────────────────────────────────────
describe('Auth guard', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/v1/categories ────────────────────────────────────────────────────
describe('POST /api/v1/categories', () => {
  const validBody = {
    name: 'Food',
    type: 'expense',
    icon: 'utensils',
    color: '#FF9800',
  };

  it('creates a category successfully', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set(AUTH_HEADER)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(mockCategory.id);
    expect(res.body.data.name).toBe('Food');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set(AUTH_HEADER)
      .send({ type: 'expense' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when icon is missing', async () => {
    const { icon, ...bodyWithoutIcon } = validBody;
    const res = await request(app)
      .post('/api/v1/categories')
      .set(AUTH_HEADER)
      .send(bodyWithoutIcon);
    expect(res.status).toBe(400);
  });

  it('returns 400 when type is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set(AUTH_HEADER)
      .send({ ...validBody, type: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when color is not a valid HEX', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set(AUTH_HEADER)
      .send({ ...validBody, color: 'not-a-hex' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when name is too short', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set(AUTH_HEADER)
      .send({ ...validBody, name: 'x' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when category already exists for user+type', async () => {
    (repo.nameExistsForUser as jest.Mock).mockResolvedValue(true);
    const res = await request(app)
      .post('/api/v1/categories')
      .set(AUTH_HEADER)
      .send(validBody);
    expect(res.status).toBe(409);
  });
});

// ── GET /api/v1/categories ────────────────────────────────────────────────────
describe('GET /api/v1/categories', () => {
  it('returns paginated category list', async () => {
    const res = await request(app)
      .get('/api/v1/categories')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('passes filter params to repository', async () => {
    await request(app)
      .get('/api/v1/categories?type=expense&page=1&limit=10&search=food')
      .set(AUTH_HEADER);

    expect(repo.listCategories).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'expense', page: 1, limit: 10, search: 'food' }),
    );
  });

  it('accepts the documented system filter', async () => {
    const res = await request(app)
      .get('/api/v1/categories?system=true')
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(repo.listCategories).toHaveBeenCalledWith(expect.objectContaining({ system: true }));
  });

  it('returns 400 when type is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/categories?type=BADTYPE')
      .set(AUTH_HEADER);
    expect(res.status).toBe(400);
  });
});

// ── GET /api/v1/categories/:id ────────────────────────────────────────────────
describe('GET /api/v1/categories/:id', () => {
  it('returns a single category', async () => {
    const res = await request(app)
      .get(`/api/v1/categories/${mockCategory.id}`)
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockCategory.id);
  });

  it('returns 404 when category is not found', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .get('/api/v1/categories/00000000-0000-0000-0000-000000000000')
      .set(AUTH_HEADER);
    expect(res.status).toBe(404);
  });

  it('returns 403 when category belongs to another user', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue({ ...mockCategory, user_id: 'other-user' });
    const res = await request(app)
      .get(`/api/v1/categories/${mockCategory.id}`)
      .set(AUTH_HEADER);
    expect(res.status).toBe(403);
  });

  it('allows access to system categories by any user', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(mockSystemCategory);
    const res = await request(app)
      .get(`/api/v1/categories/${mockSystemCategory.id}`)
      .set(AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body.data.isSystem).toBe(true);
  });

  it('returns 400 when id is not a UUID', async () => {
    const res = await request(app)
      .get('/api/v1/categories/not-a-uuid')
      .set(AUTH_HEADER);
    expect(res.status).toBe(400);
  });
});

// ── PATCH /api/v1/categories/:id ──────────────────────────────────────────────
describe('PATCH /api/v1/categories/:id', () => {
  it('updates a category successfully', async () => {
    const res = await request(app)
      .patch(`/api/v1/categories/${mockCategory.id}`)
      .set(AUTH_HEADER)
      .send({ name: 'Groceries' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when category does not exist', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/v1/categories/00000000-0000-0000-0000-000000000000')
      .set(AUTH_HEADER)
      .send({ name: 'Missing Category' });
    expect(res.status).toBe(404);
  });

  it('returns 403 when trying to update a system category', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(mockSystemCategory);
    const res = await request(app)
      .patch(`/api/v1/categories/${mockSystemCategory.id}`)
      .set(AUTH_HEADER)
      .send({ name: 'Hacked' });
    expect(res.status).toBe(403);
  });

  it('returns 400 when color is invalid HEX', async () => {
    const res = await request(app)
      .patch(`/api/v1/categories/${mockCategory.id}`)
      .set(AUTH_HEADER)
      .send({ color: 'red' });
    expect(res.status).toBe(400);
  });

  it('returns 409 on duplicate name conflict', async () => {
    (repo.nameExistsForUser as jest.Mock).mockResolvedValue(true);
    const res = await request(app)
      .patch(`/api/v1/categories/${mockCategory.id}`)
      .set(AUTH_HEADER)
      .send({ name: 'Duplicate' });
    expect(res.status).toBe(409);
  });
});

// ── DELETE /api/v1/categories/:id ─────────────────────────────────────────────
describe('DELETE /api/v1/categories/:id', () => {
  it('soft-deletes a category successfully', async () => {
    const res = await request(app)
      .delete(`/api/v1/categories/${mockCategory.id}`)
      .set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when category is not found', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .delete('/api/v1/categories/00000000-0000-0000-0000-000000000000')
      .set(AUTH_HEADER);
    expect(res.status).toBe(404);
  });

  it('returns 403 when trying to delete a system category', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(mockSystemCategory);
    const res = await request(app)
      .delete(`/api/v1/categories/${mockSystemCategory.id}`)
      .set(AUTH_HEADER);
    expect(res.status).toBe(403);
  });

  it('returns 403 when category belongs to another user', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue({ ...mockCategory, user_id: 'other-user' });
    const res = await request(app)
      .delete(`/api/v1/categories/${mockCategory.id}`)
      .set(AUTH_HEADER);
    expect(res.status).toBe(403);
  });

  it('returns 400 when id is not a UUID', async () => {
    const res = await request(app)
      .delete('/api/v1/categories/not-a-uuid')
      .set(AUTH_HEADER);
    expect(res.status).toBe(400);
  });
});
