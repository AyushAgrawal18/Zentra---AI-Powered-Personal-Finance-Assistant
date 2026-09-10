import { db } from "../../../database/connection";
import { DatabaseError } from "../../../common/errors";
import { CsvImportRecord } from "../dto";

export class CsvRepository {
  async createImport(
    userId: string,
    filename: string,
  ): Promise<CsvImportRecord> {
    try {
      const result = await db.query(
        `INSERT INTO csv_imports (user_id, filename, status) VALUES ($1, $2, 'pending') RETURNING *;`,
        [userId, filename],
      );
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(`Failed to create CSV import: ${error.message}`);
    }
  }

  async findById(id: string, userId: string): Promise<CsvImportRecord | null> {
    try {
      const result = await db.query(
        `SELECT * FROM csv_imports WHERE id = $1 AND user_id = $2;`,
        [id, userId],
      );
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find CSV import: ${error.message}`);
    }
  }

  async list(
    userId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ rows: CsvImportRecord[]; total: number }> {
    try {
      const conditions = ["user_id = $1"];
      const values: any[] = [userId];
      let index = 2;
      if (status) {
        conditions.push(`status = $${index++}`);
        values.push(status.toLowerCase());
      }
      const where = `WHERE ${conditions.join(" AND ")}`;
      const count = await db.query(
        `SELECT COUNT(*) FROM csv_imports ${where};`,
        values,
      );
      const total = Number.parseInt(count.rows[0].count, 10);
      const result = await db.query(
        `SELECT * FROM csv_imports ${where} ORDER BY created_at DESC LIMIT $${index} OFFSET $${index + 1};`,
        [...values, limit, (page - 1) * limit],
      );
      return { rows: result.rows, total };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list CSV imports: ${error.message}`);
    }
  }

  async updateCounts(
    id: string,
    userId: string,
    status: string,
    total: number,
    imported: number,
    failed: number,
  ): Promise<CsvImportRecord | null> {
    try {
      const result = await db.query(
        `UPDATE csv_imports SET status = $1, total_records = $2, imported_records = $3, failed_records = $4
         WHERE id = $5 AND user_id = $6 RETURNING *;`,
        [status, total, imported, failed, id, userId],
      );
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to update CSV import: ${error.message}`);
    }
  }

  async cancel(id: string, userId: string): Promise<boolean> {
    try {
      const result = await db.query(
        `DELETE FROM csv_imports WHERE id = $1 AND user_id = $2 AND status = 'pending';`,
        [id, userId],
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to cancel CSV import: ${error.message}`);
    }
  }

  async categoryId(
    userId: string,
    value: string,
    type: string,
  ): Promise<string | null> {
    try {
      const result = await db.query(
        `SELECT id FROM categories WHERE (user_id = $1 OR is_system = true) AND deleted_at IS NULL
         AND type = $2 AND (id::text = $3 OR LOWER(name) = LOWER($3)) LIMIT 1;`,
        [userId, type === "transfer" ? "expense" : type, value],
      );
      return result.rows[0]?.id ?? null;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to resolve CSV category: ${error.message}`,
      );
    }
  }

  async duplicate(
    userId: string,
    row: { date: Date; amount: number; merchant: string; type: string },
  ): Promise<boolean> {
    try {
      const result = await db.query(
        `SELECT 1 FROM transactions WHERE user_id = $1 AND transaction_date::date = $2::date
         AND amount = $3 AND transaction_type = $4 AND COALESCE(LOWER(merchant_name), '') = LOWER($5)
         AND deleted_at IS NULL LIMIT 1;`,
        [userId, row.date, row.amount, row.type, row.merchant],
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to detect duplicate transaction: ${error.message}`,
      );
    }
  }

  async importTransactions(
    userId: string,
    rows: Array<{
      categoryId: string;
      amount: number;
      type: string;
      merchant: string;
      date: Date;
      notes: string;
    }>,
  ): Promise<number> {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      for (const row of rows) {
        await client.query(
          `INSERT INTO transactions (user_id, category_id, amount, transaction_type, source, merchant_name, notes, transaction_date)
           VALUES ($1, $2, $3, $4, 'csv', $5, $6, $7);`,
          [
            userId,
            row.categoryId,
            row.amount,
            row.type,
            row.merchant,
            row.notes,
            row.date,
          ],
        );
      }
      await client.query("COMMIT");
      return rows.length;
    } catch (error: any) {
      await client.query("ROLLBACK");
      throw new DatabaseError(
        `Failed to import CSV transactions: ${error.message}`,
      );
    } finally {
      client.release();
    }
  }
}

export const csvRepository = new CsvRepository();
