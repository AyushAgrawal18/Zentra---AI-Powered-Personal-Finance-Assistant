import { db } from '../../../database/connection';
import { DatabaseError } from '../../../common/errors';
import { CATEGORY_DEFAULT_SORT, CATEGORY_DEFAULT_ORDER, CATEGORY_SORT_FIELDS } from '../constants';

// ─── Record interface matching categories table exactly ────────────────────────
export interface CategoryRecord {
  id: string;
  user_id: string | null;
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
  is_system: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ListCategoriesParams {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  type?: string;
  system?: boolean;
  sort?: string;
  order?: string;
}

// ─── Repository ─────────────────────────────────────────────────────────────────
export class CategoryRepository {

  async createCategory(params: {
    userId: string;
    name: string;
    type: string;
    icon?: string;
    color?: string;
  }): Promise<CategoryRecord> {
    try {
      const { userId, name, type, icon, color } = params;
      const query = `
        INSERT INTO categories (user_id, name, type, icon, color, is_system)
        VALUES ($1, $2, $3, $4, $5, false)
        RETURNING *;
      `;
      const result = await db.query(query, [
        userId,
        name,
        type,
        icon ?? null,
        color ?? null,
      ]);
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(`Failed to create category: ${error.message}`);
    }
  }

  async findCategoryById(id: string): Promise<CategoryRecord | null> {
    try {
      const query = `
        SELECT * FROM categories
        WHERE id = $1 AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [id]);
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find category: ${error.message}`);
    }
  }

  async listCategories(params: ListCategoriesParams): Promise<{ rows: CategoryRecord[]; total: number }> {
    try {
      const { userId, page, limit, search, type, system, sort, order } = params;

      // A user can see: their own categories + system categories (user_id IS NULL)
      const conditions: string[] = [
        `(c.user_id = $1 OR c.is_system = true)`,
        `c.deleted_at IS NULL`,
      ];
      const values: any[] = [userId];
      let idx = 2;

      if (type) { conditions.push(`c.type = $${idx++}`); values.push(type); }
      if (system !== undefined) { conditions.push(`c.is_system = $${idx++}`); values.push(system); }
      if (search) {
        conditions.push(`c.name ILIKE $${idx++}`);
        values.push(`%${search}%`);
      }

      const where = `WHERE ${conditions.join(' AND ')}`;

      // Whitelist sort field to prevent SQL injection.
      const sortField = CATEGORY_SORT_FIELDS[sort ?? CATEGORY_DEFAULT_SORT] ?? CATEGORY_SORT_FIELDS[CATEGORY_DEFAULT_SORT];
      const sortOrder = (order ?? CATEGORY_DEFAULT_ORDER).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const countQuery = `SELECT COUNT(*) FROM categories c ${where}`;
      const countResult = await db.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      const offset = (page - 1) * limit;
      const dataQuery = `
        SELECT c.*, COUNT(t.id)::int AS usage_count
        FROM categories c
        LEFT JOIN transactions t ON t.category_id = c.id AND t.deleted_at IS NULL
        ${where}
        GROUP BY c.id
        ORDER BY ${sortField === 'usage_count' ? 'usage_count' : `c.${sortField}`} ${sortOrder}, c.id ASC
        LIMIT $${idx++} OFFSET $${idx++};
      `;
      values.push(limit, offset);

      const dataResult = await db.query(dataQuery, values);
      return { rows: dataResult.rows, total };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list categories: ${error.message}`);
    }
  }

  async updateCategory(
    id: string,
    userId: string,
    updates: {
      name?: string;
      icon?: string;
      color?: string;
    },
  ): Promise<CategoryRecord | null> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (updates.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(updates.name); }
      if (updates.icon !== undefined) { setClauses.push(`icon = $${idx++}`); values.push(updates.icon); }
      if (updates.color !== undefined) { setClauses.push(`color = $${idx++}`); values.push(updates.color); }

      if (setClauses.length === 0) {
        return this.findCategoryById(id);
      }

      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id, userId);

      const query = `
        UPDATE categories
        SET ${setClauses.join(', ')}
        WHERE id = $${idx++} AND user_id = $${idx++} AND is_system = false AND deleted_at IS NULL
        RETURNING *;
      `;
      const result = await db.query(query, values);
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to update category: ${error.message}`);
    }
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE categories
        SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2 AND is_system = false AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [id, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to delete category: ${error.message}`);
    }
  }

  async nameExistsForUser(userId: string, name: string, type: string, excludeId?: string): Promise<boolean> {
    try {
      let query: string;
      let values: any[];

      if (excludeId) {
        query = `
          SELECT 1 FROM categories
          WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND type = $3 AND id != $4 AND deleted_at IS NULL;
        `;
        values = [userId, name, type, excludeId];
      } else {
        query = `
          SELECT 1 FROM categories
          WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND type = $3 AND deleted_at IS NULL;
        `;
        values = [userId, name, type];
      }

      const result = await db.query(query, values);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to check category name: ${error.message}`);
    }
  }

  async hasTransactions(id: string): Promise<boolean> {
    try {
      const query = `
        SELECT 1 FROM transactions
        WHERE category_id = $1 AND deleted_at IS NULL
        LIMIT 1;
      `;
      const result = await db.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to check category usage: ${error.message}`);
    }
  }
}

export const categoryRepository = new CategoryRepository();
