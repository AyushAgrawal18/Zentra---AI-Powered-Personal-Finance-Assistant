import { z } from "zod";
import {
  CSV_DEFAULT_LIMIT,
  CSV_DEFAULT_PAGE,
  CSV_MAX_LIMIT,
} from "../constants";

export const listImportsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((value) => value >= 1)
      .optional()
      .default(String(CSV_DEFAULT_PAGE)),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((value) => value >= 1 && value <= CSV_MAX_LIMIT)
      .optional()
      .default(String(CSV_DEFAULT_LIMIT)),
    status: z
      .enum([
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "pending",
        "processing",
        "completed",
        "failed",
      ])
      .optional(),
  }),
});

export const importIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("Import ID must be a valid UUID") }),
});
