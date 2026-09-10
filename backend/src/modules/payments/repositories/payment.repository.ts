import { db } from "../../../database/connection";
import { DatabaseError } from "../../../common/errors";
import {
  PAYMENT_DEFAULT_ORDER,
  PAYMENT_DEFAULT_SORT,
  PAYMENT_SORT_FIELDS,
  PAYMENT_STATUSES,
} from "../constants";
import { PaymentRecord } from "../dto";

export interface ListPaymentsParams {
  userId: string;
  page: number;
  limit: number;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: string;
}

export interface ReconciledPayment {
  payment: PaymentRecord;
  transactionId?: string;
}

export class PaymentRepository {
  async createPaymentIntent(params: {
    userId: string;
    amount: number;
    merchantName: string;
    upiId: string;
    paymentReference: string;
  }): Promise<PaymentRecord> {
    try {
      const result = await db.query(
        `INSERT INTO payment_intents (user_id, amount, merchant_name, upi_id, payment_reference)
         VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [
          params.userId,
          params.amount,
          params.merchantName,
          params.upiId,
          params.paymentReference,
        ],
      );
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to create payment intent: ${error.message}`,
      );
    }
  }

  async findById(id: string, userId: string): Promise<PaymentRecord | null> {
    try {
      const result = await db.query(
        `SELECT * FROM payment_intents WHERE id = $1 AND user_id = $2;`,
        [id, userId],
      );
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to find payment intent: ${error.message}`,
      );
    }
  }

  async findByReference(
    paymentReference: string,
    userId: string,
  ): Promise<PaymentRecord | null> {
    try {
      const result = await db.query(
        `SELECT * FROM payment_intents WHERE payment_reference = $1 AND user_id = $2;`,
        [paymentReference, userId],
      );
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to find payment reference: ${error.message}`,
      );
    }
  }

  async list(
    params: ListPaymentsParams,
  ): Promise<{ rows: PaymentRecord[]; total: number }> {
    try {
      const conditions = ["p.user_id = $1"];
      const values: any[] = [params.userId];
      let index = 2;
      if (params.status) {
        conditions.push(`p.status = $${index++}`);
        values.push(params.status.toLowerCase());
      }
      if (params.from) {
        conditions.push(`p.created_at >= $${index++}`);
        values.push(params.from);
      }
      if (params.to) {
        conditions.push(`p.created_at <= $${index++}`);
        values.push(params.to);
      }
      const where = `WHERE ${conditions.join(" AND ")}`;
      const sortField =
        PAYMENT_SORT_FIELDS[params.sort ?? PAYMENT_DEFAULT_SORT] ??
        PAYMENT_SORT_FIELDS[PAYMENT_DEFAULT_SORT];
      const sortOrder =
        (params.order ?? PAYMENT_DEFAULT_ORDER).toUpperCase() === "ASC"
          ? "ASC"
          : "DESC";

      const count = await db.query(
        `SELECT COUNT(*) FROM payment_intents p ${where};`,
        values,
      );
      const total = Number.parseInt(count.rows[0].count, 10);
      const offset = (params.page - 1) * params.limit;
      const dataValues = [...values, params.limit, offset];
      const result = await db.query(
        `SELECT p.* FROM payment_intents p ${where}
         ORDER BY p.${sortField} ${sortOrder}
         LIMIT $${index} OFFSET $${index + 1};`,
        dataValues,
      );
      return { rows: result.rows, total };
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to list payment intents: ${error.message}`,
      );
    }
  }

  async cancelPending(id: string, userId: string): Promise<boolean> {
    try {
      const result = await db.query(
        `DELETE FROM payment_intents WHERE id = $1 AND user_id = $2 AND status = $3;`,
        [id, userId, PAYMENT_STATUSES.PENDING],
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to cancel payment intent: ${error.message}`,
      );
    }
  }

  async reconcile(params: {
    id: string;
    userId: string;
    outcome: "completed" | "failed";
    categoryId?: string;
  }): Promise<ReconciledPayment | null> {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const paymentResult = await client.query(
        `SELECT * FROM payment_intents WHERE id = $1 AND user_id = $2 FOR UPDATE;`,
        [params.id, params.userId],
      );
      const payment = paymentResult.rows[0] as PaymentRecord | undefined;
      if (!payment) {
        await client.query("ROLLBACK");
        return null;
      }
      if (payment.status !== PAYMENT_STATUSES.PENDING) {
        await client.query("ROLLBACK");
        throw new Error("PAYMENT_ALREADY_RECONCILED");
      }

      if (params.outcome === PAYMENT_STATUSES.FAILED) {
        const updated = await client.query(
          `UPDATE payment_intents SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`,
          [PAYMENT_STATUSES.FAILED, params.id],
        );
        await client.query("COMMIT");
        return { payment: updated.rows[0] };
      }

      const category = await client.query(
        `SELECT 1 FROM categories WHERE id = $1 AND (user_id = $2 OR is_system = true) AND deleted_at IS NULL;`,
        [params.categoryId, params.userId],
      );
      if (category.rowCount === 0) {
        await client.query("ROLLBACK");
        throw new Error("INVALID_CATEGORY");
      }

      const transaction = await client.query(
        `INSERT INTO transactions
          (user_id, category_id, amount, transaction_type, payment_method, source, merchant_name, notes, transaction_date)
         VALUES ($1, $2, $3, 'expense', 'upi', 'api', $4, $5, CURRENT_TIMESTAMP)
         RETURNING id;`,
        [
          params.userId,
          params.categoryId,
          payment.amount,
          payment.merchant_name,
          payment.payment_reference,
        ],
      );
      const updated = await client.query(
        `UPDATE payment_intents SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`,
        [PAYMENT_STATUSES.COMPLETED, params.id],
      );
      await client.query("COMMIT");
      return {
        payment: updated.rows[0],
        transactionId: transaction.rows[0].id,
      };
    } catch (error: any) {
      try {
        await client.query("ROLLBACK");
      } catch {
        /* preserve original database error */
      }
      if (
        error.message === "PAYMENT_ALREADY_RECONCILED" ||
        error.message === "INVALID_CATEGORY"
      ) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to reconcile payment intent: ${error.message}`,
      );
    } finally {
      client.release();
    }
  }
}

export const paymentRepository = new PaymentRepository();
