import { z } from "zod";
import {
  PAYMENT_DEFAULT_LIMIT,
  PAYMENT_DEFAULT_PAGE,
  PAYMENT_MAX_LIMIT,
  PAYMENT_DEFAULT_SORT,
  PAYMENT_SORT_FIELDS,
} from "../constants";

const statusValues = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "pending",
  "completed",
  "failed",
] as const;
const sortFieldValues = Object.keys(PAYMENT_SORT_FIELDS) as [
  string,
  ...string[],
];
const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

export const initiatePaymentSchema = z.object({
  body: z.object({
    merchantName: z
      .string({ required_error: "Merchant name is required" })
      .min(1)
      .max(255)
      .trim(),
    upiId: z
      .string({ required_error: "UPI ID is required" })
      .regex(
        /^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9.-]{2,64}$/,
        "UPI ID must be valid",
      ),
    amount: z
      .number({ required_error: "Amount is required" })
      .positive("Amount must be greater than zero"),
    description: z.string().max(500).optional(),
  }),
});

export const listPaymentsSchema = z.object({
  query: z
    .object({
      status: z.enum(statusValues).optional(),
      from: isoDate.optional(),
      to: isoDate.optional(),
      page: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .refine((value) => value >= 1)
        .optional()
        .default(String(PAYMENT_DEFAULT_PAGE)),
      limit: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .refine((value) => value >= 1 && value <= PAYMENT_MAX_LIMIT)
        .optional()
        .default(String(PAYMENT_DEFAULT_LIMIT)),
      sort: z.enum(sortFieldValues).optional().default(PAYMENT_DEFAULT_SORT),
      order: z.enum(["asc", "desc"]).optional().default("desc"),
    })
    .refine(
      (query) =>
        !query.from || !query.to || new Date(query.to) >= new Date(query.from),
      {
        message: "to must not be earlier than from",
        path: ["to"],
      },
    ),
});

export const paymentIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("Payment ID must be a valid UUID") }),
});

export const reconcilePaymentSchema = z.object({
  body: z
    .object({
      outcome: z.enum(["SUCCESS", "FAILED", "success", "failed"], {
        required_error: "Reconciliation outcome is required",
      }),
      categoryId: z.string().uuid().optional(),
    })
    .refine(
      (body) =>
        body.outcome.toLowerCase() !== "success" || Boolean(body.categoryId),
      {
        message: "Category ID is required for successful reconciliation",
        path: ["categoryId"],
      },
    ),
});
