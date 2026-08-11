import { transactionRepository } from '../repositories';
import { ListTransactionsQueryDTO, TransactionResponseDTO, PaginationMeta } from '../dto';
import { mapTransactionToResponse } from '../utils';
import {
  TRANSACTION_DEFAULT_PAGE,
  TRANSACTION_DEFAULT_LIMIT,
  TRANSACTION_DEFAULT_SORT,
} from '../constants';

export interface ListTransactionsResult {
  data: TransactionResponseDTO[];
  meta: PaginationMeta;
}

export const listTransactionsService = async (
  userId: string,
  query: ListTransactionsQueryDTO,
): Promise<ListTransactionsResult> => {
  const page = query.page ?? TRANSACTION_DEFAULT_PAGE;
  const limit = query.limit ?? TRANSACTION_DEFAULT_LIMIT;

  const { rows, total } = await transactionRepository.listTransactions({
    userId,
    page,
    limit,
    search: query.search,
    categoryId: query.categoryId,
    type: query.type,
    paymentMethod: query.paymentMethod,
    source: query.source,
    from: query.from,
    to: query.to,
    minAmount: query.minAmount,
    maxAmount: query.maxAmount,
    sort: query.sort ?? TRANSACTION_DEFAULT_SORT,
    order: query.order ?? 'desc',
  });

  return {
    data: rows.map(mapTransactionToResponse),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
