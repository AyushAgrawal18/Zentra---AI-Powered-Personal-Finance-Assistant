import { transactionRepository } from '../repositories';
import { UpdateTransactionDTO, TransactionResponseDTO } from '../dto';
import { mapTransactionToResponse } from '../utils';
import { NotFoundError } from '../../../common/errors';
import { TRANSACTION_MESSAGES } from '../constants';
import { logger } from '../../../common/logger';

export const updateTransactionService = async (
  id: string,
  userId: string,
  data: UpdateTransactionDTO,
): Promise<TransactionResponseDTO> => {
  // Confirm the transaction exists and belongs to this user before update
  const existing = await transactionRepository.findTransactionById(id, userId);
  if (!existing) {
    throw new NotFoundError(TRANSACTION_MESSAGES.NOT_FOUND);
  }

  // Business rule: if a new categoryId is supplied it must be valid for this user
  if (data.categoryId) {
    const validCategory = await transactionRepository.categoryExists(data.categoryId, userId);
    if (!validCategory) {
      throw new NotFoundError(TRANSACTION_MESSAGES.INVALID_CATEGORY);
    }
  }

  const updated = await transactionRepository.updateTransaction(id, userId, {
    categoryId: data.categoryId,
    amount: data.amount,
    transactionType: data.transactionType,
    paymentMethod: data.paymentMethod,
    merchantName: data.merchantName,
    description: data.description,
    notes: data.notes,
    transactionDate: data.transactionDate ? new Date(data.transactionDate) : undefined,
  });

  if (!updated) {
    throw new NotFoundError(TRANSACTION_MESSAGES.NOT_FOUND);
  }

  logger.info({ transactionId: id, userId }, 'Transaction updated');

  return mapTransactionToResponse(updated);
};
