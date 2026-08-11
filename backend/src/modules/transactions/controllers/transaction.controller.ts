import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/middleware/auth';
import {
  createTransactionService,
  getTransactionService,
  listTransactionsService,
  updateTransactionService,
  deleteTransactionService,
  balanceService,
  summaryService,
} from '../services';
import { CreateTransactionDTO, UpdateTransactionDTO, ListTransactionsQueryDTO } from '../dto';
import { TRANSACTION_MESSAGES } from '../constants';

// POST /api/v1/transactions
export const createTransaction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as CreateTransactionDTO;
    const result = await createTransactionService(req.user!.id, data);
    res.status(201).json({
      success: true,
      message: TRANSACTION_MESSAGES.CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/transactions
export const listTransactions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = {
      ...req.query,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
    } as unknown as ListTransactionsQueryDTO;
    const result = await listTransactionsService(req.user!.id, query);
    res.status(200).json({
      success: true,
      message: TRANSACTION_MESSAGES.LIST_FETCHED,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/transactions/balance
export const getBalance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await balanceService(req.user!.id);
    res.status(200).json({
      success: true,
      message: TRANSACTION_MESSAGES.BALANCE_FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/transactions/summary  &  GET /api/v1/transactions/monthly
export const getMonthlySummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getUTCMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getUTCFullYear();

    const result = await summaryService(req.user!.id, month, year);
    res.status(200).json({
      success: true,
      message: TRANSACTION_MESSAGES.SUMMARY_FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/transactions/:id
export const getTransaction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getTransactionService(req.params.id, req.user!.id);
    res.status(200).json({
      success: true,
      message: TRANSACTION_MESSAGES.FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/transactions/:id
export const updateTransaction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as UpdateTransactionDTO;
    const result = await updateTransactionService(req.params.id, req.user!.id, data);
    res.status(200).json({
      success: true,
      message: TRANSACTION_MESSAGES.UPDATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/transactions/:id
export const deleteTransaction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteTransactionService(req.params.id, req.user!.id);
    res.status(200).json({
      success: true,
      message: TRANSACTION_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};
