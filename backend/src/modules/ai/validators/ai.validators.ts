import { z } from "zod";
import {
  INSIGHT_CATEGORIES,
  INSIGHT_DEFAULT_LIMIT,
  INSIGHT_DEFAULT_PAGE,
  INSIGHT_MAX_LIMIT,
} from "../constants";

const categoryValues = Object.keys(INSIGHT_CATEGORIES) as [string, ...string[]];
const priorityValues = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "low",
  "medium",
  "high",
] as const;
export const listInsightsSchema = z.object({
  query: z
    .object({
      category: z.enum(categoryValues).optional(),
      priority: z.enum(priorityValues).optional(),
      page: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .refine((value) => value >= 1)
        .optional()
        .default(String(INSIGHT_DEFAULT_PAGE)),
      limit: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .refine((value) => value >= 1 && value <= INSIGHT_MAX_LIMIT)
        .optional()
        .default(String(INSIGHT_DEFAULT_LIMIT)),
      sort: z.enum(["generated_at", "priority"]).optional().default("priority"),
      order: z.enum(["asc", "desc"]).optional().default("desc"),
    })
    .strict(),
});
export const insightIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("Insight ID must be a valid UUID") }),
});
