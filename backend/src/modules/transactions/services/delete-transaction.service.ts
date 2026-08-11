import { transactionRepository } from '../repositories';
import { NotFoundError } from '../../../common/errors';
import { TRANSACTION_MESSAGES } from '../constants';
import { logger } from '../../../common/logger';

export const deleteTransactionService = async (
  id: string,
  userId: string,
): Promise<void> => {
  const deleted = await transactionRepository.deleteTransaction(id, userId);
  if (!deleted) {
    throw new NotFoundError(TRANSACTION_MESSAGES.NOT_FOUND);
  }
  logger.info({ transactionId: id, userId }, 'Transaction soft-deleted');
};
