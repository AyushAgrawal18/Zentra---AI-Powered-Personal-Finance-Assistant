import { db } from '../../../database/connection';
import { DatabaseError } from '../../../common/errors';
import { GOAL_DEFAULT_SORT, GOAL_DEFAULT_ORDER, GOAL_SORT_FIELDS } from '../constants';

// ── Row interface matching the goals table exactly ────────────────────────────
export interface GoalRecord {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  target_amount: string;   // NUMERIC → string from pg driver
  current_amount: string;  // NUMERIC → string from pg driver
  target_date: Date;
  status: string;          // 'active' | 'completed' | 'cancelled'
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ListGoalsParams {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: string;
}

// ── Repository ────────────────────────────────────────────────────────────────
export class GoalRepository {

  async createGoal(params: {
    userId: string;
    name: string;
    targetAmount: number;
    targetDate: Date;
    description?: string;
  }): Promise<GoalRecord> {
    try {
      const { userId, name, targetAmount, targetDate, description } = params;
      const query = `
        INSERT INTO goals (user_id, name, target_amount, target_date, description, current_amount, status)
        VALUES ($1, $2, $3, $4, $5, 0, 'active')
        RETURNING *;
      `;
      const result = await db.query(query, [
        userId,
        name,
        targetAmount,
        targetDate,
        description ?? null,
      ]);
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(`Failed to create goal: ${error.message}`);
    }
  }

  async findGoalById(id: string, userId: string): Promise<GoalRecord | null> {
    try {
      const query = `
        SELECT * FROM goals
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [id, userId]);
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find goal: ${error.message}`);
    }
  }

  async listGoals(params: ListGoalsParams): Promise<{ rows: GoalRecord[]; total: number }> {
    try {
      const { userId, page, limit, search, status, sort, order } = params;

      const conditions: string[] = ['user_id = $1', 'deleted_at IS NULL'];
      const values: any[] = [userId];
      let idx = 2;

      if (status) {
        // Accept uppercase (ACTIVE) or lowercase (active) from callers
        conditions.push(`LOWER(status::text) = $${idx++}`);
        values.push(status.toLowerCase());
      }
      if (search) {
        conditions.push(`name ILIKE $${idx++}`);
        values.push(`%${search}%`);
      }

      const where = `WHERE ${conditions.join(' AND ')}`;

      const sortField =
        GOAL_SORT_FIELDS[sort ?? GOAL_DEFAULT_SORT] ?? GOAL_SORT_FIELDS[GOAL_DEFAULT_SORT];
      const sortOrder =
        (order ?? GOAL_DEFAULT_ORDER).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const countQuery = `SELECT COUNT(*) FROM goals ${where}`;
      const countResult = await db.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      const offset = (page - 1) * limit;
      const dataQuery = `
        SELECT *
        FROM goals
        ${where}
        ORDER BY ${sortField} ${sortOrder}
        LIMIT $${idx++} OFFSET $${idx++};
      `;
      values.push(limit, offset);

      const dataResult = await db.query(dataQuery, values);
      return { rows: dataResult.rows, total };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list goals: ${error.message}`);
    }
  }

  async updateGoal(
    id: string,
    userId: string,
    updates: {
      name?: string;
      targetAmount?: number;
      targetDate?: Date;
      description?: string;
      status?: string;
    },
  ): Promise<GoalRecord | null> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (updates.name !== undefined) {
        setClauses.push(`name = $${idx++}`);
        values.push(updates.name);
      }
      if (updates.targetAmount !== undefined) {
        setClauses.push(`target_amount = $${idx++}`);
        values.push(updates.targetAmount);
      }
      if (updates.targetDate !== undefined) {
        setClauses.push(`target_date = $${idx++}`);
        values.push(updates.targetDate);
      }
      if (updates.description !== undefined) {
        setClauses.push(`description = $${idx++}`);
        values.push(updates.description);
      }
      if (updates.status !== undefined) {
        setClauses.push(`status = $${idx++}`);
        values.push(updates.status);
      }

      if (setClauses.length === 0) {
        return this.findGoalById(id, userId);
      }

      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id, userId);

      const query = `
        UPDATE goals
        SET ${setClauses.join(', ')}
        WHERE id = $${idx++} AND user_id = $${idx++} AND deleted_at IS NULL
        RETURNING *;
      `;
      const result = await db.query(query, values);
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to update goal: ${error.message}`);
    }
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE goals
        SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [id, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to delete goal: ${error.message}`);
    }
  }

  /**
   * Atomically add a contribution to current_amount and optionally flip status
   * to 'completed' when target is reached.  Returns the updated row.
   */
  async addContribution(
    id: string,
    userId: string,
    amount: number,
  ): Promise<GoalRecord | null> {
    try {
      const query = `
        UPDATE goals
        SET
          current_amount = current_amount + $1,
          status = CASE
            WHEN current_amount + $1 >= target_amount THEN 'completed'::goal_status
            ELSE status
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
        RETURNING *;
      `;
      const result = await db.query(query, [amount, id, userId]);
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to add contribution: ${error.message}`);
    }
  }

  async nameExistsForUser(userId: string, name: string, excludeId?: string): Promise<boolean> {
    try {
      let query: string;
      let values: any[];

      if (excludeId) {
        query = `
          SELECT 1 FROM goals
          WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND id != $3 AND deleted_at IS NULL;
        `;
        values = [userId, name, excludeId];
      } else {
        query = `
          SELECT 1 FROM goals
          WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND deleted_at IS NULL;
        `;
        values = [userId, name];
      }

      const result = await db.query(query, values);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to check goal name: ${error.message}`);
    }
  }
}

export const goalRepository = new GoalRepository();
