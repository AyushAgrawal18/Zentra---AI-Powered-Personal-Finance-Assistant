import { z } from 'zod';
import {
  CATEGORY_TYPES,
  CATEGORY_SORT_FIELDS,
  CATEGORY_DEFAULT_LIMIT,
  CATEGORY_DEFAULT_PAGE,
  CATEGORY_MAX_LIMIT,
} from '../constants';

const categoryTypeValues = [CATEGORY_TYPES.INCOME, CATEGORY_TYPES.EXPENSE] as const;
const sortFieldValues = Object.keys(CATEGORY_SORT_FIELDS) as [string, ...string[]];

// HEX color regex: #RGB or #RRGGBB
const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    type: z.enum(categoryTypeValues, {
      required_error: 'Type is required',
      invalid_type_error: 'Type must be income or expense',
    }),
    icon: z
      .string({ required_error: 'Icon is required' })
      .min(1, 'Icon is required')
      .max(50, 'Icon must not exceed 50 characters')
      .trim(),
    color: z
      .string()
      .regex(hexColorRegex, 'Color must be a valid HEX color (e.g. #3B82F6)')
      .optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim()
      .optional(),
    icon: z
      .string()
      .max(50, 'Icon must not exceed 50 characters')
      .trim()
      .optional(),
    color: z
      .string()
      .regex(hexColorRegex, 'Color must be a valid HEX color (e.g. #3B82F6)')
      .optional(),
  }),
});

export const listCategoriesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .transform(Number)
      .refine((n) => n >= 1, 'Page must be at least 1')
      .optional()
      .default(String(CATEGORY_DEFAULT_PAGE)),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(
        (n) => n >= 1 && n <= CATEGORY_MAX_LIMIT,
        `Limit must be between 1 and ${CATEGORY_MAX_LIMIT}`,
      )
      .optional()
      .default(String(CATEGORY_DEFAULT_LIMIT)),
    search: z.string().max(255).optional(),
    type: z.enum(categoryTypeValues).optional(),
    system: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
    sort: z.enum(sortFieldValues).optional().default(CATEGORY_SORT_FIELDS['name']),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Category ID must be a valid UUID'),
  }),
});
