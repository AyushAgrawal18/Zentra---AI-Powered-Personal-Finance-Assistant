import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  query: z.object({
    month: z
      .string()
      .regex(/^\d+$/, 'Month must be a number')
      .transform(Number)
      .refine((n) => n >= 1 && n <= 12, 'Month must be between 1 and 12')
      .optional(),
    year: z
      .string()
      .regex(/^\d+$/, 'Year must be a number')
      .transform(Number)
      .refine((n) => n >= 2000 && n <= 2100, 'Year must be between 2000 and 2100')
      .optional(),
  }),
});
