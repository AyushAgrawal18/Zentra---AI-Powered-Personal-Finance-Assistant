import { z } from 'zod';
import {
  GOAL_SORT_FIELDS,
  GOAL_DEFAULT_LIMIT,
  GOAL_DEFAULT_PAGE,
  GOAL_MAX_LIMIT,
} from '../constants';

const sortFieldValues = Object.keys(GOAL_SORT_FIELDS) as [string, ...string[]];
const statusValues = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'active', 'completed', 'cancelled'] as const;

// ── Create Goal ───────────────────────────────────────────────────────────────
export const createGoalSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Goal name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    targetAmount: z
      .number({ required_error: 'Target amount is required' })
      .positive('Target amount must be greater than 0'),
    targetDate: z
      .string({ required_error: 'Target date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format')
      .refine(
        (d) => new Date(d) >= new Date(new Date().toISOString().split('T')[0]),
        'Target date must be today or a future date',
      ),
    notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
    description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  }),
});

// ── Update Goal ───────────────────────────────────────────────────────────────
export const updateGoalSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim()
      .optional(),
    targetAmount: z
      .number()
      .positive('Target amount must be greater than 0')
      .optional(),
    targetDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format')
      .refine(
        (d) => new Date(d) >= new Date(new Date().toISOString().split('T')[0]),
        'Target date must be today or a future date',
      )
      .optional(),
    notes: z.string().max(1000).optional(),
    description: z.string().max(1000).optional(),
    status: z
      .enum(['active', 'cancelled'], {
        invalid_type_error: "Status must be 'active' or 'cancelled'",
      })
      .optional(),
  }),
});

// ── List Goals Query ──────────────────────────────────────────────────────────
export const listGoalsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .transform(Number)
      .refine((n) => n >= 1, 'Page must be at least 1')
      .optional()
      .default(String(GOAL_DEFAULT_PAGE)),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(
        (n) => n >= 1 && n <= GOAL_MAX_LIMIT,
        `Limit must be between 1 and ${GOAL_MAX_LIMIT}`,
      )
      .optional()
      .default(String(GOAL_DEFAULT_LIMIT)),
    search: z.string().max(255).optional(),
    status: z.enum(statusValues).optional(),
    sort: z.enum(sortFieldValues).optional().default(GOAL_SORT_FIELDS['created_at']),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// ── Goal ID Param ─────────────────────────────────────────────────────────────
export const goalIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Goal ID must be a valid UUID'),
  }),
});

// ── Contribute to Goal ────────────────────────────────────────────────────────
export const contributeGoalSchema = z.object({
  body: z.object({
    amount: z
      .number({ required_error: 'Contribution amount is required' })
      .positive('Contribution amount must be greater than 0'),
    notes: z.string().max(500).optional(),
  }),
});
