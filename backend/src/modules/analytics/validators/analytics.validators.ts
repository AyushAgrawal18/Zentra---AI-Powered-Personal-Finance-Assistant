import { z } from 'zod';

const periodValues = ['daily', 'weekly', 'monthly', 'yearly'] as const;
const transactionTypeValues = ['income', 'expense', 'transfer'] as const;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }, 'Invalid date');

const analyticsFilterFields = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  category: z.string().uuid('Category ID must be a valid UUID').optional(),
  type: z.enum(transactionTypeValues).optional(),
}).strict();

export const dateRangeSchema = z.object({
  query: analyticsFilterFields.refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: 'From date must be before or equal to To date',
  }),
});

export const spendingQuerySchema = z.object({
  query: analyticsFilterFields.extend({
    period: z.enum(periodValues).optional().default('monthly'),
  }).refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: 'From date must be before or equal to To date',
  }),
});

export const monthlyQuerySchema = z.object({
  query: z.object({
    month: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1 && n <= 12).optional(),
    year: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 2000 && n <= 2100).optional(),
  }).strict(),
});

export const yearlyQuerySchema = z.object({
  query: z.object({
    year: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 2000 && n <= 2100).optional(),
  }).strict(),
});
