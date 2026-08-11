import { z } from 'zod';
import {
  BUDGET_SORT_FIELDS,
  BUDGET_DEFAULT_LIMIT,
  BUDGET_DEFAULT_PAGE,
  BUDGET_MAX_LIMIT,
} from '../constants';

const sortFieldValues = Object.keys(BUDGET_SORT_FIELDS) as [string, ...string[]];
const periodEnumValues = ['MONTHLY', 'QUARTERLY', 'YEARLY', 'monthly', 'weekly', 'yearly'] as const;

export const createBudgetSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name cannot be empty').max(255).trim().optional(),
      categoryId: z.string().uuid('Category ID must be a valid UUID').nullable().optional(),
      amount: z
        .number({ required_error: 'Amount is required' })
        .positive('Amount must be greater than 0'),
      period: z.enum(periodEnumValues).optional().default('MONTHLY'),
      alertThreshold: z
        .number()
        .min(1, 'Alert threshold must be at least 1')
        .max(100, 'Alert threshold must not exceed 100')
        .optional()
        .default(80),
      month: z
        .number()
        .int()
        .min(1, 'Month must be between 1 and 12')
        .max(12, 'Month must be between 1 and 12')
        .optional(),
      year: z
        .number()
        .int()
        .min(1900, 'Year must be valid')
        .max(2100, 'Year must be valid')
        .optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return new Date(data.endDate) >= new Date(data.startDate);
        }
        return true;
      },
      {
        message: 'End date must not be earlier than start date',
        path: ['endDate'],
      },
    ),
});

export const updateBudgetSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name cannot be empty').max(255).trim().optional(),
      categoryId: z.string().uuid('Category ID must be a valid UUID').nullable().optional(),
      amount: z.number().positive('Amount must be greater than 0').optional(),
      period: z.enum(periodEnumValues).optional(),
      alertThreshold: z
        .number()
        .min(1, 'Alert threshold must be at least 1')
        .max(100, 'Alert threshold must not exceed 100')
        .optional(),
      month: z
        .number()
        .int()
        .min(1, 'Month must be between 1 and 12')
        .max(12, 'Month must be between 1 and 12')
        .optional(),
      year: z
        .number()
        .int()
        .min(1900, 'Year must be valid')
        .max(2100, 'Year must be valid')
        .optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return new Date(data.endDate) >= new Date(data.startDate);
        }
        return true;
      },
      {
        message: 'End date must not be earlier than start date',
        path: ['endDate'],
      },
    ),
});

export const listBudgetsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .transform(Number)
      .refine((n) => n >= 1, 'Page must be at least 1')
      .optional()
      .default(String(BUDGET_DEFAULT_PAGE)),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(
        (n) => n >= 1 && n <= BUDGET_MAX_LIMIT,
        `Limit must be between 1 and ${BUDGET_MAX_LIMIT}`,
      )
      .optional()
      .default(String(BUDGET_DEFAULT_LIMIT)),
    search: z.string().max(255).optional(),
    period: z.string().optional(),
    category: z.string().uuid('Category must be a valid UUID').optional(),
    categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
    status: z.string().optional(),
    month: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((n) => n >= 1 && n <= 12, 'Month must be between 1 and 12')
      .optional(),
    year: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .optional(),
    sort: z.enum(sortFieldValues).optional().default(BUDGET_SORT_FIELDS['created_at']),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const budgetIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Budget ID must be a valid UUID'),
  }),
});
