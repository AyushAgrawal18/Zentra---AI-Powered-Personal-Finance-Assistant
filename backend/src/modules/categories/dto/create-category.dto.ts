import { z } from 'zod';
import { createCategorySchema, updateCategorySchema, listCategoriesSchema } from '../validators';

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>['body'];
export type ListCategoriesQueryDTO = z.infer<typeof listCategoriesSchema>['query'];

// The canonical shape returned from every category endpoint
export interface CategoryResponseDTO {
  id: string;
  userId: string | null;
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pagination meta (shared with transactions module)
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
