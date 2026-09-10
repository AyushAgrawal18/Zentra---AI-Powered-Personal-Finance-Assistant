import { db } from "../../../database/connection";
import { DatabaseError } from "../../../common/errors";
import { ReportRecord } from "../dto";

export interface ReportFilters {
  from?: string;
  to?: string;
  month?: number;
  year?: number;
  categoryId?: string;
  transactionType?: string;
  paymentMethod?: string;
}

function conditions(
  filters: ReportFilters,
  start = 2,
): { sql: string; values: any[] } {
  const clauses = ["t.user_id = $1", "t.deleted_at IS NULL"];
  const values: any[] = [];
  let index = start;
  if (filters.from) {
    clauses.push(`t.transaction_date >= $${index++}`);
    values.push(filters.from);
  }
  if (filters.to) {
    clauses.push(`t.transaction_date < ($${index++}::date + INTERVAL '1 day')`);
    values.push(filters.to);
  }
  if (filters.month !== undefined) {
    clauses.push(`EXTRACT(MONTH FROM t.transaction_date) = $${index++}`);
    values.push(filters.month);
  }
  if (filters.year !== undefined) {
    clauses.push(`EXTRACT(YEAR FROM t.transaction_date) = $${index++}`);
    values.push(filters.year);
  }
  if (filters.categoryId) {
    clauses.push(`t.category_id = $${index++}`);
    values.push(filters.categoryId);
  }
  if (filters.transactionType) {
    clauses.push(`t.transaction_type = $${index++}`);
    values.push(filters.transactionType);
  }
  if (filters.paymentMethod) {
    clauses.push(`t.payment_method = $${index++}`);
    values.push(filters.paymentMethod);
  }
  return { sql: clauses.join(" AND "), values };
}

export class ReportRepository {
  async create(
    userId: string,
    reportType: string,
    parameters: Record<string, unknown>,
    fileUrl: string,
  ): Promise<ReportRecord> {
    try {
      const result = await db.query(
        `INSERT INTO reports (user_id, report_type, parameters, file_url) VALUES ($1, $2, $3, $4) RETURNING *;`,
        [userId, reportType, parameters, fileUrl],
      );
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(`Failed to create report: ${error.message}`);
    }
  }

  async findById(id: string, userId: string): Promise<ReportRecord | null> {
    try {
      const result = await db.query(
        "SELECT * FROM reports WHERE id = $1 AND user_id = $2;",
        [id, userId],
      );
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find report: ${error.message}`);
    }
  }

  async list(
    userId: string,
    page: number,
    limit: number,
    reportType?: string,
    format?: string,
  ): Promise<{ rows: ReportRecord[]; total: number }> {
    try {
      const clauses = ["user_id = $1"];
      const values: any[] = [userId];
      let index = 2;
      if (reportType) {
        clauses.push(`report_type = $${index++}`);
        values.push(reportType);
      }
      if (format) {
        clauses.push(`parameters->>'format' = $${index++}`);
        values.push(format);
      }
      const where = `WHERE ${clauses.join(" AND ")}`;
      const count = await db.query(
        `SELECT COUNT(*) FROM reports ${where};`,
        values,
      );
      const result = await db.query(
        `SELECT * FROM reports ${where} ORDER BY created_at DESC LIMIT $${index} OFFSET $${index + 1};`,
        [...values, limit, (page - 1) * limit],
      );
      return {
        rows: result.rows,
        total: Number.parseInt(count.rows[0].count, 10),
      };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list reports: ${error.message}`);
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const result = await db.query(
        "DELETE FROM reports WHERE id = $1 AND user_id = $2;",
        [id, userId],
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to delete report: ${error.message}`);
    }
  }

  async updateSnapshot(
    id: string,
    userId: string,
    parameters: Record<string, unknown>,
    fileUrl: string,
  ): Promise<ReportRecord | null> {
    try {
      const result = await db.query(
        `UPDATE reports SET parameters = $1, file_url = $2 WHERE id = $3 AND user_id = $4 RETURNING *;`,
        [parameters, fileUrl, id, userId],
      );
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to update report snapshot: ${error.message}`,
      );
    }
  }

  async getSummary(userId: string, filters: ReportFilters) {
    try {
      const filter = conditions(filters);
      const result = await db.query(
        `SELECT COUNT(*) AS transaction_count,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) AS expense
        FROM transactions t WHERE ${filter.sql};`,
        [userId, ...filter.values],
      );
      const row = result.rows[0];
      return {
        transactionCount: Number(row.transaction_count),
        income: Number(row.income),
        expense: Number(row.expense),
      };
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to aggregate report summary: ${error.message}`,
      );
    }
  }

  async getCategories(userId: string, filters: ReportFilters) {
    try {
      const filter = conditions(filters);
      const result = await db.query(
        `SELECT COALESCE(c.name, 'Uncategorized') AS category, SUM(t.amount) AS amount, COUNT(*) AS count
        FROM transactions t LEFT JOIN categories c ON c.id = t.category_id
        WHERE ${filter.sql} AND t.transaction_type = 'expense' GROUP BY c.name ORDER BY amount DESC;`,
        [userId, ...filter.values],
      );
      return result.rows.map((row) => ({
        category: row.category,
        amount: Number(row.amount),
        count: Number(row.count),
      }));
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to aggregate report categories: ${error.message}`,
      );
    }
  }

  async getTransactions(userId: string, filters: ReportFilters) {
    try {
      const filter = conditions(filters);
      const result = await db.query(
        `SELECT t.id, t.transaction_date, t.amount, t.transaction_type, t.payment_method, t.merchant_name, t.description, c.name AS category
        FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE ${filter.sql} ORDER BY t.transaction_date ASC;`,
        [userId, ...filter.values],
      );
      return result.rows.map((row) => ({
        ...row,
        amount: Number(row.amount),
        transactionDate: new Date(row.transaction_date).toISOString(),
        category: row.category ?? "Uncategorized",
      }));
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to fetch report transactions: ${error.message}`,
      );
    }
  }

  async getBudgets(userId: string, filters: ReportFilters) {
    try {
      const result = await db.query(
        `SELECT b.id, b.name, b.amount AS budget_amount, b.month, b.year,
          COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent_amount
         FROM budgets b
         LEFT JOIN transactions t ON t.user_id = b.user_id AND t.category_id = b.category_id
           AND t.deleted_at IS NULL
           AND ($2::date IS NULL OR t.transaction_date >= $2::date)
           AND ($3::date IS NULL OR t.transaction_date < ($3::date + INTERVAL '1 day'))
         WHERE b.user_id = $1 AND b.deleted_at IS NULL
           AND ($4::int IS NULL OR b.month = $4) AND ($5::int IS NULL OR b.year = $5)
         GROUP BY b.id ORDER BY b.year DESC NULLS LAST, b.month DESC NULLS LAST;`,
        [
          userId,
          filters.from ?? null,
          filters.to ?? null,
          filters.month ?? null,
          filters.year ?? null,
        ],
      );
      return result.rows.map((row) => ({
        ...row,
        budgetAmount: Number(row.budget_amount),
        spentAmount: Number(row.spent_amount),
        remainingAmount: Number(row.budget_amount) - Number(row.spent_amount),
      }));
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to aggregate budget report: ${error.message}`,
      );
    }
  }

  async getGoals(userId: string) {
    try {
      const result = await db.query(
        `SELECT id, name, target_amount, current_amount, target_date, status FROM goals WHERE user_id = $1 AND deleted_at IS NULL ORDER BY target_date ASC;`,
        [userId],
      );
      return result.rows.map((row) => ({
        ...row,
        targetAmount: Number(row.target_amount),
        currentAmount: Number(row.current_amount),
        remainingAmount: Math.max(
          Number(row.target_amount) - Number(row.current_amount),
          0,
        ),
        progressPercentage: Number(row.target_amount)
          ? Number(
              (
                (Number(row.current_amount) / Number(row.target_amount)) *
                100
              ).toFixed(2),
            )
          : 0,
      }));
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to aggregate goal report: ${error.message}`,
      );
    }
  }
}

export const reportRepository = new ReportRepository();
