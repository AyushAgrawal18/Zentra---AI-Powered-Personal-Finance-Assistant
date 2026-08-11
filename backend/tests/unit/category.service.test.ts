import { categoryRepository } from '../../src/modules/categories/repositories';
import { createCategoryService } from '../../src/modules/categories/services/create-category.service';
import { getCategoryService } from '../../src/modules/categories/services/get-category.service';
import { listCategoriesService } from '../../src/modules/categories/services/list-categories.service';
import { updateCategoryService } from '../../src/modules/categories/services/update-category.service';
import { deleteCategoryService } from '../../src/modules/categories/services/delete-category.service';
import { NotFoundError, AuthorizationError, ConflictError } from '../../src/common/errors';

// ── Mock the repository ────────────────────────────────────────────────────────
jest.mock('../../src/modules/categories/repositories');

const repo = categoryRepository;

const mockCategory = {
  id: 'cat-uuid-1',
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
  id: 'cat-sys-1',
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

// ── createCategoryService ──────────────────────────────────────────────────────
describe('createCategoryService', () => {
  const validInput = {
    name: 'Food',
    type: 'expense' as const,
    icon: 'utensils',
    color: '#FF9800',
  };

  it('creates a category and returns mapped DTO', async () => {
    const result = await createCategoryService('user-uuid-1', validInput);
    expect(result.id).toBe('cat-uuid-1');
    expect(result.name).toBe('Food');
    expect(result.type).toBe('expense');
    expect(repo.createCategory).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictError when category name already exists for user+type', async () => {
    (repo.nameExistsForUser as jest.Mock).mockResolvedValue(true);
    await expect(createCategoryService('user-uuid-1', validInput)).rejects.toThrow(ConflictError);
    expect(repo.createCategory).not.toHaveBeenCalled();
  });
});

// ── getCategoryService ─────────────────────────────────────────────────────────
describe('getCategoryService', () => {
  it('returns the category when it belongs to the user', async () => {
    const result = await getCategoryService('cat-uuid-1', 'user-uuid-1');
    expect(result.id).toBe('cat-uuid-1');
    expect(repo.findCategoryById).toHaveBeenCalledWith('cat-uuid-1');
  });

  it('returns a system category to any user', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(mockSystemCategory);
    const result = await getCategoryService('cat-sys-1', 'any-user-id');
    expect(result.isSystem).toBe(true);
  });

  it('throws NotFoundError when category does not exist', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(null);
    await expect(getCategoryService('no-such-id', 'user-uuid-1')).rejects.toThrow(NotFoundError);
  });

  it('throws AuthorizationError when category belongs to another user', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue({ ...mockCategory, user_id: 'other-user' });
    await expect(getCategoryService('cat-uuid-1', 'user-uuid-1')).rejects.toThrow(AuthorizationError);
  });
});

// ── listCategoriesService ──────────────────────────────────────────────────────
describe('listCategoriesService', () => {
  it('returns paginated category list', async () => {
    const result = await listCategoriesService('user-uuid-1', { page: 1, limit: 50 } as any);
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });

  it('passes search, filter and pagination params to repository', async () => {
    await listCategoriesService('user-uuid-1', { page: 2, limit: 10, search: 'food', type: 'expense' } as any);
    expect(repo.listCategories).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 10, search: 'food', type: 'expense' }),
    );
  });

  it('returns empty result when no categories found', async () => {
    (repo.listCategories as jest.Mock).mockResolvedValue({ rows: [], total: 0 });
    const result = await listCategoriesService('user-uuid-1', {} as any);
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });
});

// ── updateCategoryService ──────────────────────────────────────────────────────
describe('updateCategoryService', () => {
  it('updates and returns the updated category', async () => {
    const result = await updateCategoryService('cat-uuid-1', 'user-uuid-1', { name: 'Groceries' });
    expect(result.id).toBe('cat-uuid-1');
    expect(repo.updateCategory).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError when category does not exist', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(null);
    await expect(updateCategoryService('no-id', 'user-uuid-1', { name: 'x' })).rejects.toThrow(NotFoundError);
  });

  it('throws AuthorizationError when trying to update a system category', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(mockSystemCategory);
    await expect(updateCategoryService('cat-sys-1', 'user-uuid-1', { name: 'Hacked' })).rejects.toThrow(AuthorizationError);
    expect(repo.updateCategory).not.toHaveBeenCalled();
  });

  it('throws AuthorizationError when category belongs to another user', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue({ ...mockCategory, user_id: 'other-user' });
    await expect(updateCategoryService('cat-uuid-1', 'user-uuid-1', { name: 'x' })).rejects.toThrow(AuthorizationError);
  });

  it('throws ConflictError when updated name already exists for same user+type', async () => {
    (repo.nameExistsForUser as jest.Mock).mockResolvedValue(true);
    await expect(updateCategoryService('cat-uuid-1', 'user-uuid-1', { name: 'Duplicate' })).rejects.toThrow(ConflictError);
    expect(repo.updateCategory).not.toHaveBeenCalled();
  });
});

// ── deleteCategoryService ──────────────────────────────────────────────────────
describe('deleteCategoryService', () => {
  it('soft-deletes the category', async () => {
    await expect(deleteCategoryService('cat-uuid-1', 'user-uuid-1')).resolves.not.toThrow();
    expect(repo.deleteCategory).toHaveBeenCalledWith('cat-uuid-1', 'user-uuid-1');
  });

  it('throws NotFoundError when category does not exist', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(null);
    await expect(deleteCategoryService('no-id', 'user-uuid-1')).rejects.toThrow(NotFoundError);
  });

  it('throws AuthorizationError when trying to delete a system category', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue(mockSystemCategory);
    await expect(deleteCategoryService('cat-sys-1', 'user-uuid-1')).rejects.toThrow(AuthorizationError);
    expect(repo.deleteCategory).not.toHaveBeenCalled();
  });

  it('throws AuthorizationError when category belongs to another user', async () => {
    (repo.findCategoryById as jest.Mock).mockResolvedValue({ ...mockCategory, user_id: 'other-user' });
    await expect(deleteCategoryService('cat-uuid-1', 'user-uuid-1')).rejects.toThrow(AuthorizationError);
  });

  it('throws NotFoundError when delete returns false (already deleted)', async () => {
    (repo.deleteCategory as jest.Mock).mockResolvedValue(false);
    await expect(deleteCategoryService('cat-uuid-1', 'user-uuid-1')).rejects.toThrow(NotFoundError);
  });
});
