import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/middleware/auth';
import {
  createBudgetService,
  getBudgetService,
  listBudgetsService,
  updateBudgetService,
  deleteBudgetService,
  getBudgetProgressService,
  getBudgetSummaryService,
} from '../services';
import { CreateBudgetDTO, UpdateBudgetDTO, ListBudgetsQueryDTO } from '../dto';
import { BUDGET_MESSAGES } from '../constants';

// POST /api/v1/budgets
export const createBudget = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as CreateBudgetDTO;
    const result = await createBudgetService(req.user!.id, data);
    res.status(201).json({
      success: true,
      message: BUDGET_MESSAGES.CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/budgets
export const listBudgets = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = {
      ...req.query,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
    } as unknown as ListBudgetsQueryDTO;
    const result = await listBudgetsService(req.user!.id, query);
    res.status(200).json({
      success: true,
      message: BUDGET_MESSAGES.LIST_FETCHED,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/budgets/summary
export const getBudgetSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getBudgetSummaryService(req.user!.id);
    res.status(200).json({
      success: true,
      message: BUDGET_MESSAGES.SUMMARY_FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/budgets/:id
export const getBudget = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getBudgetService(req.params.id, req.user!.id);
    res.status(200).json({
      success: true,
      message: BUDGET_MESSAGES.FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/budgets/:id/progress
export const getBudgetProgress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getBudgetProgressService(req.params.id, req.user!.id);
    res.status(200).json({
      success: true,
      message: BUDGET_MESSAGES.PROGRESS_FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/budgets/:id
export const updateBudget = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as UpdateBudgetDTO;
    const result = await updateBudgetService(req.params.id, req.user!.id, data);
    res.status(200).json({
      success: true,
      message: BUDGET_MESSAGES.UPDATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/budgets/:id
export const deleteBudget = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteBudgetService(req.params.id, req.user!.id);
    res.status(200).json({
      success: true,
      message: BUDGET_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};
