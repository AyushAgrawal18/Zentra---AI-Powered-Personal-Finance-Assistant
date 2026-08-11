import { z } from 'zod';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsSchema,
} from '../validators';

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>['body'];
export type UpdateTransactionDTO = z.infer<typeof updateTransactionSchema>['body'];
export type ListTransactionsQueryDTO = z.infer<typeof listTransactionsSchema>['query'];

// The canonical shape returned from every transaction endpoint
export interface TransactionResponseDTO {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  transactionType: string;
  paymentMethod: string | null;
  source: string | null;
  merchantName: string | null;
  description: string | null;
  notes: string | null;
  transactionDate: string;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Pagination meta returned on list endpoints
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
