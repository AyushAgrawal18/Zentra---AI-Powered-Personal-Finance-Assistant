import { db } from '../../../database/connection';
import { DatabaseError } from '../../../common/errors';

export class AnalyticsRepository {
  async getSummary(userId: string, from?: string, to?: string) {
    try {
      const query = `
        SELECT
          COUNT(*) as transaction_count,
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
        FROM transactions
        WHERE user_id = $1 AND deleted_at IS NULL
          AND ($2::date IS NULL OR transaction_date >= $2::date)
          AND ($3::date IS NULL OR transaction_date <= $3::date)
      `;
      const result = await db.query(query, [userId, from ?? null, to ?? null]);
      const row = result.rows[0];
      return {
        transactionCount: parseInt(row.transaction_count, 10),
        totalIncome: parseFloat(row.total_income),
        totalExpense: parseFloat(row.total_expense),
      };
    } catch (error: any) {
      throw new DatabaseError(`Failed to fetch analytics summary: ${error.message}`);
    }
  }

  async getCategoryBreakdown(userId: string, from?: string, to?: string) {
    try {
      const query = `
        SELECT
          c.name as category,
          SUM(t.amount) as amount
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1 AND t.transaction_type = 'expense' AND t.deleted_at IS NULL
          AND ($2::date IS NULL OR t.transaction_date >= $2::date)
          AND ($3::date IS NULL OR t.transaction_date <= $3::date)
        GROUP BY c.name
        ORDER BY amount DESC
      `;
      const result = await db.query(query, [userId, from ?? null, to ?? null]);
      return result.rows.map((row) => ({
        category: row.category ?? 'Uncategorized',
        amount: parseFloat(row.amount),
      }));
    } catch (error: any) {
      throw new DatabaseError(`Failed to fetch category breakdown: ${error.message}`);
    }
  }

  async getTrends(userId: string, period: string, from?: string, to?: string) {
    try {
      // Map period to PostgreSQL date_trunc fields
      let pgPeriod = 'month';
      if (period === 'daily') pgPeriod = 'day';
      if (period === 'weekly') pgPeriod = 'week';
      if (period === 'yearly') pgPeriod = 'year';

      const query = `
        SELECT
          date_trunc($2, transaction_date) as period_label,
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as expense
        FROM transactions
        WHERE user_id = $1 AND deleted_at IS NULL
          AND ($3::date IS NULL OR transaction_date >= $3::date)
          AND ($4::date IS NULL OR transaction_date <= $4::date)
        GROUP BY period_label
        ORDER BY period_label ASC
      `;
      const result = await db.query(query, [userId, pgPeriod, from ?? null, to ?? null]);
      
      return result.rows.map(row => ({
        label: new Date(row.period_label).toISOString(),
        income: parseFloat(row.income),
        expense: parseFloat(row.expense),
      }));
    } catch (error: any) {
      throw new DatabaseError(`Failed to fetch trends: ${error.message}`);
    }
  }

  async getOpeningBalance(userId: string, date: string) {
    try {
      const query = `
        SELECT
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as opening_balance
        FROM transactions
        WHERE user_id = $1 AND deleted_at IS NULL
          AND transaction_date < $2::date
      `;
      const result = await db.query(query, [userId, date]);
      return parseFloat(result.rows[0].opening_balance);
    } catch (error: any) {
      throw new DatabaseError(`Failed to fetch opening balance: ${error.message}`);
    }
  }
}

export const analyticsRepository = new AnalyticsRepository();
