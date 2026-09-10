import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../../../common/middleware/auth';
import { INSIGHT_MESSAGES } from '../constants';
import { getInsightService, listInsightsService, markInsightViewedService, refreshInsightsService } from '../services';

export const listInsights = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try { const query = { ...req.query, page: req.query.page ? Number(req.query.page) : undefined, limit: req.query.limit ? Number(req.query.limit) : undefined } as any; const result = await listInsightsService(req.user!.id, query); res.status(200).json({ success: true, message: INSIGHT_MESSAGES.LIST_FETCHED, data: result.data, meta: result.meta }); }
  catch (error) { next(error); }
};
export const getInsight = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try { res.status(200).json({ success: true, message: INSIGHT_MESSAGES.FETCHED, data: await getInsightService(req.params.id, req.user!.id) }); }
  catch (error) { next(error); }
};
export const refreshInsights = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try { res.status(200).json({ success: true, message: INSIGHT_MESSAGES.REFRESHED, data: await refreshInsightsService(req.user!.id) }); }
  catch (error) { next(error); }
};
export const listInsightHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try { const query = { ...req.query, page: req.query.page ? Number(req.query.page) : undefined, limit: req.query.limit ? Number(req.query.limit) : undefined } as any; const result = await listInsightsService(req.user!.id, query, true); res.status(200).json({ success: true, message: INSIGHT_MESSAGES.HISTORY_FETCHED, data: result.data, meta: result.meta }); }
  catch (error) { next(error); }
};

// Internal read tracking remains separate from the public endpoint contract.
export const markInsightViewed = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try { res.status(200).json({ success: true, data: await markInsightViewedService(req.params.id, req.user!.id) }); }
  catch (error) { next(error); }
};
