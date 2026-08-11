import { transactionRepository } from '../repositories';
import { TransactionResponseDTO } from '../dto';
import { mapTransactionToResponse } from '../utils';
import { NotFoundError } from '../../../common/errors';
import { TRANSACTION_MESSAGES } from '../constants';

export const getTransactionService = async (
  id: string,
  userId: string,
): Promise<TransactionResponseDTO> => {
  const transaction = await transactionRepository.findTransactionById(id, userId);
  if (!transaction) {
    throw new NotFoundError(TRANSACTION_MESSAGES.NOT_FOUND);
  }
  return mapTransactionToResponse(transaction);
};
