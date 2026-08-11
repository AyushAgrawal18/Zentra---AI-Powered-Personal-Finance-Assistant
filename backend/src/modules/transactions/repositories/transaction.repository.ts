import { db } from '../../../database/connection';
import { DatabaseError } from '../../../common/errors';
import { TRANSACTION_DEFAULT_SORT, TRANSACTION_DEFAULT_ORDER, TRANSACTION_SORT_FIELDS } from '../constants';

// ─── Record interface matching transactions table exactly ─────────────────────
export interface TransactionRecord {
  id: string;
  user_id: string;
  category_id: string;
  amount: string; // NUMERIC comes back as string from pg driver
  transaction_type: string;
  payment_method: string | null;
  source: string | null;
  merchant_name: string | null;
  description: string | null;
  notes: string | null;
  transaction_date: Date;
  attachment_url: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ListTransactionsParams {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  type?: string;
  paymentMethod?: string;
  source?: string;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
  sort?: string;
  order?: string;
}

export interface BalanceResult {
  income: number;
  expense: number;
  balance: number;
}

export interface MonthlySummaryResult {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    categoryId: string;
    transactionType: string;
    total: number;
    count: number;
  }>;
}

// ─── Repository ────────────────────────────────────────────────────────────────
export class TransactionRepository {

  async createTransaction(params: {
    userId: string;
    categoryId: string;
    amount: number;
    transactionType: string;
    paymentMethod?: string;
    source?: string;
    merchantName?: string;
    description?: string;
    notes?: string;
    transactionDate: Date;
  }): Promise<TransactionRecord> {
    try {
      const {
        userId, categoryId, amount, transactionType,
        paymentMethod, source, merchantName, description,
        notes, transactionDate,
      } = params;

      const query = `
        INSERT INTO transactions (
          user_id, category_id, amount, transaction_type,
          payment_method, source, merchant_name, description,
          notes, transaction_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const result = await db.query(query, [
        userId, categoryId, amount, transactionType,
        paymentMethod ?? null, source ?? 'manual', merchantName ?? null,
        description ?? null, notes ?? null, transactionDate,
      ]);
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(`Failed to create transaction: ${error.message}`);
    }
  }

  async findTransactionById(id: string, userId: string): Promise<TransactionRecord | null> {
    try {
      const query = `
        SELECT * FROM transactions
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [id, userId]);
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find transaction: ${error.message}`);
    }
  }

  async listTransactions(params: ListTransactionsParams): Promise<{ rows: TransactionRecord[]; total: number }> {
    try {
      const {
        userId, page, limit,
        search, categoryId, type, paymentMethod, source,
        from, to, minAmount, maxAmount, sort, order,
      } = params;

      const conditions: string[] = ['t.user_id = $1', 't.deleted_at IS NULL'];
      const values: any[] = [userId];
      let idx = 2;

      if (type) { conditions.push(`t.transaction_type = $${idx++}`); values.push(type); }
      if (categoryId) { conditions.push(`t.category_id = $${idx++}`); values.push(categoryId); }
      if (paymentMethod) { conditions.push(`t.payment_method = $${idx++}`); values.push(paymentMethod); }
      if (source) { conditions.push(`t.source = $${idx++}`); values.push(source); }
      if (from) { conditions.push(`t.transaction_date >= $${idx++}`); values.push(from); }
      if (to) { conditions.push(`t.transaction_date <= $${idx++}`); values.push(to); }
      if (minAmount !== undefined) { conditions.push(`t.amount >= $${idx++}`); values.push(minAmount); }
      if (maxAmount !== undefined) { conditions.push(`t.amount <= $${idx++}`); values.push(maxAmount); }
      if (search) {
        conditions.push(`(t.merchant_name ILIKE $${idx} OR t.notes ILIKE $${idx} OR t.description ILIKE $${idx})`);
        values.push(`%${search}%`);
        idx++;
      }

      const where = `WHERE ${conditions.join(' AND ')}`;

      // Validate sort field to prevent SQL injection (whitelist approach)
      const sortField = TRANSACTION_SORT_FIELDS[sort ?? TRANSACTION_DEFAULT_SORT] ?? TRANSACTION_SORT_FIELDS[TRANSACTION_DEFAULT_SORT];
      const sortOrder = (order ?? TRANSACTION_DEFAULT_ORDER).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const countQuery = `SELECT COUNT(*) FROM transactions t ${where}`;
      const countResult = await db.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      const offset = (page - 1) * limit;
      const dataQuery = `
        SELECT t.*
        FROM transactions t
        ${where}
        ORDER BY t.${sortField} ${sortOrder}
        LIMIT $${idx++} OFFSET $${idx++};
      `;
      values.push(limit, offset);

      const dataResult = await db.query(dataQuery, values);
      return { rows: dataResult.rows, total };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list transactions: ${error.message}`);
    }
  }

  async updateTransaction(
    id: string,
    userId: string,
    updates: {
      categoryId?: string;
      amount?: number;
      transactionType?: string;
      paymentMethod?: string;
      merchantName?: string;
      description?: string;
      notes?: string;
      transactionDate?: Date;
    },
  ): Promise<TransactionRecord | null> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (updates.categoryId !== undefined) { setClauses.push(`category_id = $${idx++}`); values.push(updates.categoryId); }
      if (updates.amount !== undefined) { setClauses.push(`amount = $${idx++}`); values.push(updates.amount); }
      if (updates.transactionType !== undefined) { setClauses.push(`transaction_type = $${idx++}`); values.push(updates.transactionType); }
      if (updates.paymentMethod !== undefined) { setClauses.push(`payment_method = $${idx++}`); values.push(updates.paymentMethod); }
      if (updates.merchantName !== undefined) { setClauses.push(`merchant_name = $${idx++}`); values.push(updates.merchantName); }
      if (updates.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(updates.description); }
      if (updates.notes !== undefined) { setClauses.push(`notes = $${idx++}`); values.push(updates.notes); }
      if (updates.transactionDate !== undefined) { setClauses.push(`transaction_date = $${idx++}`); values.push(updates.transactionDate); }

      if (setClauses.length === 0) {
        return this.findTransactionById(id, userId);
      }

      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id, userId);

      const query = `
        UPDATE transactions
        SET ${setClauses.join(', ')}
        WHERE id = $${idx++} AND user_id = $${idx++} AND deleted_at IS NULL
        RETURNING *;
      `;
      const result = await db.query(query, values);
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to update transaction: ${error.message}`);
    }
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE transactions
        SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [id, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to delete transaction: ${error.message}`);
    }
  }

  async calculateBalance(userId: string): Promise<BalanceResult> {
    try {
      const query = `
        SELECT
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0)   AS income,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0)  AS expense
        FROM transactions
        WHERE user_id = $1 AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [userId]);
      const income = parseFloat(result.rows[0].income);
      const expense = parseFloat(result.rows[0].expense);
      return { income, expense, balance: income - expense };
    } catch (error: any) {
      throw new DatabaseError(`Failed to calculate balance: ${error.message}`);
    }
  }

  async monthlySummary(userId: string, month: number, year: number): Promise<MonthlySummaryResult> {
    try {
      // ISO date range for the given month/year
      const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();

      const totalsQuery = `
        SELECT
          COALESCE(SUM(CASE WHEN transaction_type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
          COUNT(*) AS transaction_count
        FROM transactions
        WHERE user_id = $1
          AND transaction_date >= $2
          AND transaction_date <= $3
          AND deleted_at IS NULL;
      `;
      const totalsResult = await db.query(totalsQuery, [userId, startDate, endDate]);

      const breakdownQuery = `
        SELECT
          category_id,
          transaction_type,
          COALESCE(SUM(amount), 0) AS total,
          COUNT(*)                 AS count
        FROM transactions
        WHERE user_id = $1
          AND transaction_date >= $2
          AND transaction_date <= $3
          AND deleted_at IS NULL
        GROUP BY category_id, transaction_type
        ORDER BY total DESC;
      `;
      const breakdownResult = await db.query(breakdownQuery, [userId, startDate, endDate]);

      const totalIncome = parseFloat(totalsResult.rows[0].total_income);
      const totalExpense = parseFloat(totalsResult.rows[0].total_expense);

      return {
        month,
        year,
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        transactionCount: parseInt(totalsResult.rows[0].transaction_count, 10),
        categoryBreakdown: breakdownResult.rows.map((r) => ({
          categoryId: r.category_id,
          transactionType: r.transaction_type,
          total: parseFloat(r.total),
          count: parseInt(r.count, 10),
        })),
      };
    } catch (error: any) {
      throw new DatabaseError(`Failed to get monthly summary: ${error.message}`);
    }
  }

  async categoryExists(categoryId: string, userId: string): Promise<boolean> {
    try {
      // A category belongs to the user OR is a global system category (user_id IS NULL)
      const query = `
        SELECT 1 FROM categories
        WHERE id = $1 AND (user_id = $2 OR is_system = true) AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [categoryId, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to verify category: ${error.message}`);
    }
  }
}

export const transactionRepository = new TransactionRepository();
