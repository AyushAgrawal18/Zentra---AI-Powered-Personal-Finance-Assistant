import { TransactionRecord } from '../repositories';
import { TransactionResponseDTO } from '../dto';

/**
 * Maps a raw database transaction row to the public-facing DTO.
 * The mapper is the only place that should know about DB column names.
 */
export const mapTransactionToResponse = (record: TransactionRecord): TransactionResponseDTO => ({
  id: record.id,
  userId: record.user_id,
  categoryId: record.category_id,
  amount: parseFloat(record.amount), // pg returns NUMERIC as string
  transactionType: record.transaction_type,
  paymentMethod: record.payment_method,
  source: record.source,
  merchantName: record.merchant_name,
  description: record.description,
  notes: record.notes,
  transactionDate: record.transaction_date.toISOString(),
  attachmentUrl: record.attachment_url,
  createdAt: record.created_at.toISOString(),
  updatedAt: record.updated_at.toISOString(),
});
