import { z } from "zod";
import {
  REPORT_DEFAULT_LIMIT,
  REPORT_DEFAULT_PAGE,
  REPORT_FORMATS,
  REPORT_MAX_LIMIT,
  REPORT_TYPES,
} from "../constants";

const reportTypeValues = Object.values(REPORT_TYPES) as [string, ...string[]];
const formatValues = Object.values(REPORT_FORMATS) as [string, ...string[]];
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, "Invalid date");

const filterFields = z
  .object({
    from: dateSchema.optional(),
    to: dateSchema.optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    categoryId: z.string().uuid().optional(),
    transactionType: z.enum(["income", "expense", "transfer"]).optional(),
    paymentMethod: z.enum(["cash", "card", "bank_transfer", "upi"]).optional(),
  })
  .strict()
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: "From date must be before or equal to To date",
    path: ["to"],
  });

export const createReportSchema = z.object({
  body: z
    .object({
      reportType: z.enum(reportTypeValues),
      format: z.enum(formatValues),
      month: z.number().int().min(1).max(12).optional(),
      year: z.number().int().min(2000).max(2100).optional(),
      from: dateSchema.optional(),
      to: dateSchema.optional(),
      categoryId: z.string().uuid().optional(),
      transactionType: z.enum(["income", "expense", "transfer"]).optional(),
      paymentMethod: z
        .enum(["cash", "card", "bank_transfer", "upi"])
        .optional(),
    })
    .strict()
    .refine((value) => !value.from || !value.to || value.from <= value.to, {
      message: "From date must be before or equal to To date",
      path: ["to"],
    }),
});

export const listReportsSchema = z.object({
  query: z
    .object({
      reportType: z.enum(reportTypeValues).optional(),
      type: z.enum(reportTypeValues).optional(),
      format: z.enum(formatValues).optional(),
      page: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .refine((value) => value >= 1)
        .optional()
        .default(String(REPORT_DEFAULT_PAGE)),
      limit: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .refine((value) => value >= 1 && value <= REPORT_MAX_LIMIT)
        .optional()
        .default(String(REPORT_DEFAULT_LIMIT)),
    })
    .strict(),
});

export const reportIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("Report ID must be a valid UUID") }),
});
export const reportFilterSchema = z.object({ query: filterFields });
