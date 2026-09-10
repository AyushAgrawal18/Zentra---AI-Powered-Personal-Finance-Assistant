import { db } from "../../../database/connection";
import { DatabaseError } from "../../../common/errors";
import { InsightRecord } from "../dto";

export interface InsightListParams {
  userId: string;
  page: number;
  limit: number;
  type?: string;
  priority?: string;
  sort?: string;
  order?: string;
  history?: boolean;
}

export class AiRepository {
  async create(
    userId: string,
    insight: {
      title: string;
      message: string;
      type: string;
      priority: string;
      expiresAt?: Date;
    },
  ): Promise<InsightRecord> {
    try {
      const result = await db.query(
        `INSERT INTO ai_insights (user_id, title, message, insight_type, priority, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
        [
          userId,
          insight.title,
          insight.message,
          insight.type,
          insight.priority,
          insight.expiresAt ?? null,
        ],
      );
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(`Failed to create AI insight: ${error.message}`);
    }
  }

  async findById(id: string, userId: string): Promise<InsightRecord | null> {
    try {
      const result = await db.query(
        "SELECT * FROM ai_insights WHERE id = $1 AND user_id = $2;",
        [id, userId],
      );
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find AI insight: ${error.message}`);
    }
  }

  async list(
    params: InsightListParams,
  ): Promise<{ rows: InsightRecord[]; total: number }> {
    try {
      const clauses = ["user_id = $1"];
      const values: any[] = [params.userId];
      let index = 2;
      if (!params.history)
        clauses.push("(expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)");
      if (params.type) {
        clauses.push(`insight_type = $${index++}`);
        values.push(params.type);
      }
      if (params.priority) {
        clauses.push(`priority = $${index++}`);
        values.push(params.priority.toLowerCase());
      }
      const where = `WHERE ${clauses.join(" AND ")}`;
      const count = await db.query(
        `SELECT COUNT(*) FROM ai_insights ${where};`,
        values,
      );
      const sort =
        params.sort === "generated_at"
          ? "generated_at"
          : `CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END`;
      const order =
        (params.order ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
      const result = await db.query(
        `SELECT * FROM ai_insights ${where} ORDER BY ${sort} ${order}, generated_at DESC LIMIT $${index} OFFSET $${index + 1};`,
        [...values, params.limit, (params.page - 1) * params.limit],
      );
      return {
        rows: result.rows,
        total: Number.parseInt(count.rows[0].count, 10),
      };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list AI insights: ${error.message}`);
    }
  }

  async markViewed(id: string, userId: string): Promise<InsightRecord | null> {
    try {
      const result = await db.query(
        "UPDATE ai_insights SET viewed_at = COALESCE(viewed_at, CURRENT_TIMESTAMP) WHERE id = $1 AND user_id = $2 RETURNING *;",
        [id, userId],
      );
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to mark AI insight viewed: ${error.message}`,
      );
    }
  }

  async getContext(userId: string) {
    try {
      const [summary, categories, budgets, goals] = await Promise.all([
        db.query(
          `SELECT COUNT(*) AS count, COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS income, COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS expense FROM transactions WHERE user_id = $1 AND deleted_at IS NULL;`,
          [userId],
        ),
        db.query(
          `SELECT c.name AS category, COALESCE(SUM(t.amount), 0) AS amount FROM transactions t JOIN categories c ON c.id = t.category_id WHERE t.user_id = $1 AND t.transaction_type = 'expense' AND t.deleted_at IS NULL GROUP BY c.name ORDER BY amount DESC LIMIT 5;`,
          [userId],
        ),
        db.query(
          `SELECT b.name, b.amount, b.month, b.year, b.category_id,
          COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent_amount
          FROM budgets b LEFT JOIN transactions t ON t.user_id = b.user_id AND t.category_id = b.category_id AND t.deleted_at IS NULL
          WHERE b.user_id = $1 AND b.deleted_at IS NULL GROUP BY b.id;`,
          [userId],
        ),
        db.query(
          `SELECT name, target_amount, current_amount, target_date, status FROM goals WHERE user_id = $1 AND deleted_at IS NULL;`,
          [userId],
        ),
      ]);
      return {
        summary: summary.rows[0],
        categories: categories.rows,
        budgets: budgets.rows,
        goals: goals.rows,
      };
    } catch (error: any) {
      throw new DatabaseError(`Failed to build AI context: ${error.message}`);
    }
  }
}

export const aiRepository = new AiRepository();
