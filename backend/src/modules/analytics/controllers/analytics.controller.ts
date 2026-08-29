import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/middleware/auth';
import {
  getSummaryService,
  getIncomeExpenseService,
  getCategoriesService,
  getSpendingService,
  getCashFlowService,
  getMonthlyService,
  getYearlyService,
} from '../services';
import { DateRangeQueryDTO, SpendingQueryDTO, MonthlyQueryDTO, YearlyQueryDTO } from '../dto';
import { ANALYTICS_MESSAGES } from '../constants';

export const getSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as DateRangeQueryDTO;
    const data = await getSummaryService(req.user!.id, query);
    res.status(200).json({ success: true, message: ANALYTICS_MESSAGES.SUMMARY_FETCHED, data });
  } catch (error) { next(error); }
};

export const getSpending = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as SpendingQueryDTO;
    const data = await getSpendingService(req.user!.id, query);
    res.status(200).json({ success: true, message: ANALYTICS_MESSAGES.SPENDING_FETCHED, data });
  } catch (error) { next(error); }
};

export const getIncomeExpense = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as DateRangeQueryDTO;
    const data = await getIncomeExpenseService(req.user!.id, query);
    res.status(200).json({ success: true, message: ANALYTICS_MESSAGES.INCOME_EXPENSE_FETCHED, data });
  } catch (error) { next(error); }
};

export const getCategories = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as DateRangeQueryDTO;
    const data = await getCategoriesService(req.user!.id, query);
    res.status(200).json({ success: true, message: ANALYTICS_MESSAGES.CATEGORIES_FETCHED, data });
  } catch (error) { next(error); }
};

export const getCashFlow = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as SpendingQueryDTO;
    const data = await getCashFlowService(req.user!.id, query);
    res.status(200).json({ success: true, message: ANALYTICS_MESSAGES.CASH_FLOW_FETCHED, data });
  } catch (error) { next(error); }
};

export const getMonthly = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as MonthlyQueryDTO;
    const data = await getMonthlyService(req.user!.id, query);
    res.status(200).json({ success: true, message: ANALYTICS_MESSAGES.MONTHLY_FETCHED, data });
  } catch (error) { next(error); }
};

export const getYearly = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as YearlyQueryDTO;
    const data = await getYearlyService(req.user!.id, query);
    res.status(200).json({ success: true, message: ANALYTICS_MESSAGES.YEARLY_FETCHED, data });
  } catch (error) { next(error); }
};
