import { transactionRepository } from '../repositories';
import { CreateTransactionDTO, TransactionResponseDTO } from '../dto';
import { mapTransactionToResponse } from '../utils';
import { NotFoundError } from '../../../common/errors';
import { TRANSACTION_MESSAGES } from '../constants';
import { logger } from '../../../common/logger';

export const createTransactionService = async (
  userId: string,
  data: CreateTransactionDTO,
): Promise<TransactionResponseDTO> => {
  // Business rule: category must exist and belong to the user or be a default category
  const validCategory = await transactionRepository.categoryExists(data.categoryId, userId);
  if (!validCategory) {
    throw new NotFoundError(TRANSACTION_MESSAGES.INVALID_CATEGORY);
  }

  const transaction = await transactionRepository.createTransaction({
    userId,
    categoryId: data.categoryId,
    amount: data.amount,
    transactionType: data.transactionType,
    paymentMethod: data.paymentMethod,
    source: data.source,
    merchantName: data.merchantName,
    description: data.description,
    notes: data.notes,
    transactionDate: new Date(data.transactionDate),
  });

  logger.info({ transactionId: transaction.id, userId }, 'Transaction created');

  return mapTransactionToResponse(transaction);
};
