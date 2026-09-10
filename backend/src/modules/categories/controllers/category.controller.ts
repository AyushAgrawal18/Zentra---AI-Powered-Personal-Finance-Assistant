import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/middleware/auth';
import {
  createCategoryService,
  getCategoryService,
  listCategoriesService,
  updateCategoryService,
  deleteCategoryService,
} from '../services';
import { CreateCategoryDTO, UpdateCategoryDTO, ListCategoriesQueryDTO } from '../dto';
import { CATEGORY_MESSAGES } from '../constants';

// POST /api/v1/categories
export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as CreateCategoryDTO;
    const result = await createCategoryService(req.user!.id, data);
    res.status(201).json({
      success: true,
      message: CATEGORY_MESSAGES.CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/categories
export const listCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = {
      ...req.query,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      system: req.query.system === undefined ? undefined : req.query.system === 'true',
    } as unknown as ListCategoriesQueryDTO;
    const result = await listCategoriesService(req.user!.id, query);
    res.status(200).json({
      success: true,
      message: CATEGORY_MESSAGES.LIST_FETCHED,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/categories/:id
export const getCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getCategoryService(req.params.id, req.user!.id);
    res.status(200).json({
      success: true,
      message: CATEGORY_MESSAGES.FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/categories/:id
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as UpdateCategoryDTO;
    const result = await updateCategoryService(req.params.id, req.user!.id, data);
    res.status(200).json({
      success: true,
      message: CATEGORY_MESSAGES.UPDATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/categories/:id
export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteCategoryService(req.params.id, req.user!.id);
    res.status(200).json({
      success: true,
      message: CATEGORY_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};
