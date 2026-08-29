import { z } from 'zod';

const periodValues = ['daily', 'weekly', 'monthly', 'yearly'] as const;

export const dateRangeSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).refine((data) => {
    if (data.from && data.to) {
      return new Date(data.from) <= new Date(data.to);
    }
    return true;
  }, 'From date must be before or equal to To date'),
});

export const spendingQuerySchema = z.object({
  query: z.object({
    period: z.enum(periodValues).optional().default('monthly'),
    from: z.string().optional(),
    to: z.string().optional(),
  }).refine((data) => {
    if (data.from && data.to) {
      return new Date(data.from) <= new Date(data.to);
    }
    return true;
  }, 'From date must be before or equal to To date'),
});

export const monthlyQuerySchema = z.object({
  query: z.object({
    month: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1 && n <= 12).optional(),
    year: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 2000 && n <= 2100).optional(),
  }),
});

export const yearlyQuerySchema = z.object({
  query: z.object({
    year: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 2000 && n <= 2100).optional(),
  }),
});
