import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/middleware/auth';
import {
  createGoalService,
  getGoalService,
  listGoalsService,
  updateGoalService,
  deleteGoalService,
  contributeGoalService,
  getGoalProgressService,
} from '../services';
import { CreateGoalDTO, UpdateGoalDTO, ListGoalsQueryDTO, ContributeGoalDTO } from '../dto';
import { GOAL_MESSAGES } from '../constants';

// POST /api/v1/goals
export const createGoal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as CreateGoalDTO;
    const result = await createGoalService(req.user!.id, data);
    res.status(201).json({
      success: true,
      message: GOAL_MESSAGES.CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/goals
export const listGoals = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = {
      ...req.query,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    } as unknown as ListGoalsQueryDTO;
    const result = await listGoalsService(req.user!.id, query);
    res.status(200).json({
      success: true,
      message: GOAL_MESSAGES.LIST_FETCHED,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/goals/:id
export const getGoal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getGoalService(req.params.id, req.user!.id);
    res.status(200).json({
      success: true,
      message: GOAL_MESSAGES.FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/goals/:id
export const updateGoal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as UpdateGoalDTO;
    const result = await updateGoalService(req.params.id, req.user!.id, data);
    res.status(200).json({
      success: true,
      message: GOAL_MESSAGES.UPDATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/goals/:id
export const deleteGoal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteGoalService(req.params.id, req.user!.id);
    res.status(200).json({
      success: true,
      message: GOAL_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/goals/:id/contribute
export const contributeGoal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as ContributeGoalDTO;
    const result = await contributeGoalService(req.params.id, req.user!.id, data);
    res.status(200).json({
      success: true,
      message: GOAL_MESSAGES.CONTRIBUTION_ADDED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/goals/:id/progress
export const getGoalProgress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getGoalProgressService(req.params.id, req.user!.id);
    res.status(200).json({
      success: true,
      message: GOAL_MESSAGES.PROGRESS_FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
