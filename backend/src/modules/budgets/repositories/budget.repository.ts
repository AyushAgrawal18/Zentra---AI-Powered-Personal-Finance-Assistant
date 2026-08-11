import { db } from '../../../database/connection';
import { DatabaseError } from '../../../common/errors';
import { BUDGET_DEFAULT_SORT, BUDGET_DEFAULT_ORDER, BUDGET_SORT_FIELDS } from '../constants';

export interface BudgetRecord {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string | null;
  amount: string;
  spent_amount: string | null;
  remaining_amount: string | null;
  alert_threshold: number | null;
  period: string | null;
  month: number | null;
  year: number | null;
  start_date: Date | null;
  end_date: Date | null;
  status: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  category_name?: string | null;
}

export interface ListBudgetsParams {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  period?: string;
  status?: string;
  month?: number;
  year?: number;
  sort?: string;
  order?: string;
}

export class BudgetRepository {
  async createBudget(params: {
    userId: string;
    categoryId?: string | null;
    name?: string;
    amount: number;
    alertThreshold?: number;
    period?: string;
    month?: number;
    year?: number;
    startDate?: Date | null;
    endDate?: Date | null;
  }): Promise<BudgetRecord> {
    try {
      const {
        userId,
        categoryId,
        name,
        amount,
        alertThreshold = 80,
        period = 'monthly',
        month,
        year,
        startDate,
        endDate,
      } = params;

      const query = `
        INSERT INTO budgets (
          user_id, category_id, name, amount, alert_threshold,
          period, month, year, start_date, end_date, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
        RETURNING *;
      `;
      const result = await db.query(query, [
        userId,
        categoryId ?? null,
        name ?? null,
        amount,
        alertThreshold,
        period.toLowerCase(),
        month ?? null,
        year ?? null,
        startDate ?? null,
        endDate ?? null,
      ]);
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(`Failed to create budget: ${error.message}`);
    }
  }

  async findBudgetById(id: string, userId: string): Promise<BudgetRecord | null> {
    try {
      const query = `
        SELECT b.*, c.name as category_name
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = $1 AND b.user_id = $2 AND b.deleted_at IS NULL;
      `;
      const result = await db.query(query, [id, userId]);
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find budget: ${error.message}`);
    }
  }

  async listBudgets(params: ListBudgetsParams): Promise<{ rows: BudgetRecord[]; total: number }> {
    try {
      const {
        userId,
        page,
        limit,
        search,
        categoryId,
        period,
        month,
        year,
        sort,
        order,
      } = params;

      const conditions: string[] = ['b.user_id = $1', 'b.deleted_at IS NULL'];
      const values: any[] = [userId];
      let idx = 2;

      if (categoryId) {
        conditions.push(`b.category_id = $${idx++}`);
        values.push(categoryId);
      }
      if (period) {
        conditions.push(`LOWER(b.period::text) = $${idx++}`);
        values.push(period.toLowerCase());
      }
      if (month) {
        conditions.push(`b.month = $${idx++}`);
        values.push(month);
      }
      if (year) {
        conditions.push(`b.year = $${idx++}`);
        values.push(year);
      }
      if (search) {
        conditions.push(`(b.name ILIKE $${idx} OR c.name ILIKE $${idx})`);
        values.push(`%${search}%`);
        idx++;
      }

      const where = `WHERE ${conditions.join(' AND ')}`;

      const sortField = BUDGET_SORT_FIELDS[sort ?? BUDGET_DEFAULT_SORT] ?? BUDGET_SORT_FIELDS[BUDGET_DEFAULT_SORT];
      const sortOrder = (order ?? BUDGET_DEFAULT_ORDER).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const countQuery = `
        SELECT COUNT(*)
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        ${where}
      `;
      const countResult = await db.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      const offset = (page - 1) * limit;
      const dataQuery = `
        SELECT b.*, c.name as category_name
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        ${where}
        ORDER BY b.${sortField} ${sortOrder}
        LIMIT $${idx++} OFFSET $${idx++};
      `;
      values.push(limit, offset);

      const dataResult = await db.query(dataQuery, values);
      return { rows: dataResult.rows, total };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list budgets: ${error.message}`);
    }
  }

  async updateBudget(
    id: string,
    userId: string,
    updates: {
      name?: string;
      categoryId?: string | null;
      amount?: number;
      alertThreshold?: number;
      period?: string;
      month?: number;
      year?: number;
      startDate?: Date | null;
      endDate?: Date | null;
    },
  ): Promise<BudgetRecord | null> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (updates.name !== undefined) {
        setClauses.push(`name = $${idx++}`);
        values.push(updates.name);
      }
      if (updates.categoryId !== undefined) {
        setClauses.push(`category_id = $${idx++}`);
        values.push(updates.categoryId);
      }
      if (updates.amount !== undefined) {
        setClauses.push(`amount = $${idx++}`);
        values.push(updates.amount);
      }
      if (updates.alertThreshold !== undefined) {
        setClauses.push(`alert_threshold = $${idx++}`);
        values.push(updates.alertThreshold);
      }
      if (updates.period !== undefined) {
        setClauses.push(`period = $${idx++}`);
        values.push(updates.period.toLowerCase());
      }
      if (updates.month !== undefined) {
        setClauses.push(`month = $${idx++}`);
        values.push(updates.month);
      }
      if (updates.year !== undefined) {
        setClauses.push(`year = $${idx++}`);
        values.push(updates.year);
      }
      if (updates.startDate !== undefined) {
        setClauses.push(`start_date = $${idx++}`);
        values.push(updates.startDate);
      }
      if (updates.endDate !== undefined) {
        setClauses.push(`end_date = $${idx++}`);
        values.push(updates.endDate);
      }

      if (setClauses.length === 0) {
        return this.findBudgetById(id, userId);
      }

      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id, userId);

      const query = `
        UPDATE budgets
        SET ${setClauses.join(', ')}
        WHERE id = $${idx++} AND user_id = $${idx++} AND deleted_at IS NULL
        RETURNING *;
      `;
      const result = await db.query(query, values);
      if (!result.rows[0]) return null;

      return this.findBudgetById(id, userId);
    } catch (error: any) {
      throw new DatabaseError(`Failed to update budget: ${error.message}`);
    }
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE budgets
        SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [id, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to delete budget: ${error.message}`);
    }
  }

  async budgetExistsForCategoryAndPeriod(
    userId: string,
    categoryId: string | null,
    month: number,
    year: number,
    excludeId?: string,
  ): Promise<boolean> {
    try {
      let query: string;
      let values: any[];

      if (categoryId) {
        if (excludeId) {
          query = `
            SELECT 1 FROM budgets
            WHERE user_id = $1 AND category_id = $2 AND month = $3 AND year = $4 AND id != $5 AND deleted_at IS NULL;
          `;
          values = [userId, categoryId, month, year, excludeId];
        } else {
          query = `
            SELECT 1 FROM budgets
            WHERE user_id = $1 AND category_id = $2 AND month = $3 AND year = $4 AND deleted_at IS NULL;
          `;
          values = [userId, categoryId, month, year];
        }
      } else {
        if (excludeId) {
          query = `
            SELECT 1 FROM budgets
            WHERE user_id = $1 AND category_id IS NULL AND month = $2 AND year = $3 AND id != $4 AND deleted_at IS NULL;
          `;
          values = [userId, month, year, excludeId];
        } else {
          query = `
            SELECT 1 FROM budgets
            WHERE user_id = $1 AND category_id IS NULL AND month = $2 AND year = $3 AND deleted_at IS NULL;
          `;
          values = [userId, month, year];
        }
      }

      const result = await db.query(query, values);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to check existing budget: ${error.message}`);
    }
  }

  async calculateSpentAmount(
    userId: string,
    categoryId: string | null,
    month?: number | null,
    year?: number | null,
    startDate?: Date | null,
    endDate?: Date | null,
  ): Promise<number> {
    try {
      const conditions: string[] = [
        'user_id = $1',
        "transaction_type = 'expense'",
        'deleted_at IS NULL',
      ];
      const values: any[] = [userId];
      let idx = 2;

      if (categoryId) {
        conditions.push(`category_id = $${idx++}`);
        values.push(categoryId);
      }

      if (startDate && endDate) {
        conditions.push(`transaction_date >= $${idx++}`);
        values.push(startDate);
        conditions.push(`transaction_date <= $${idx++}`);
        values.push(endDate);
      } else if (month && year) {
        conditions.push(`EXTRACT(MONTH FROM transaction_date) = $${idx++}`);
        values.push(month);
        conditions.push(`EXTRACT(YEAR FROM transaction_date) = $${idx++}`);
        values.push(year);
      }

      const query = `
        SELECT COALESCE(SUM(amount), 0) AS spent
        FROM transactions
        WHERE ${conditions.join(' AND ')};
      `;
      const result = await db.query(query, values);
      return parseFloat(result.rows[0].spent);
    } catch (error: any) {
      throw new DatabaseError(`Failed to calculate spent amount: ${error.message}`);
    }
  }

  async getCategory(categoryId: string, userId: string): Promise<{ id: string; name: string; type: string; is_system: boolean } | null> {
    try {
      const query = `
        SELECT id, name, type, is_system
        FROM categories
        WHERE id = $1 AND (user_id = $2 OR is_system = true) AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [categoryId, userId]);
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to get category: ${error.message}`);
    }
  }
}

export const budgetRepository = new BudgetRepository();
