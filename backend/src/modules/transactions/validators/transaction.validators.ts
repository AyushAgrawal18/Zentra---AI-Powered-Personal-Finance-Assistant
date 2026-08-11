import { z } from 'zod';
import {
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
  TRANSACTION_SOURCES,
  TRANSACTION_SORT_FIELDS,
  TRANSACTION_DEFAULT_LIMIT,
  TRANSACTION_DEFAULT_PAGE,
  TRANSACTION_MAX_LIMIT,
} from '../constants';

const transactionTypeValues = [
  TRANSACTION_TYPES.INCOME,
  TRANSACTION_TYPES.EXPENSE,
  TRANSACTION_TYPES.TRANSFER,
] as const;

const paymentMethodValues = [
  PAYMENT_METHODS.CASH,
  PAYMENT_METHODS.CARD,
  PAYMENT_METHODS.BANK_TRANSFER,
  PAYMENT_METHODS.UPI,
] as const;

const transactionSourceValues = [
  TRANSACTION_SOURCES.MANUAL,
  TRANSACTION_SOURCES.CSV,
  TRANSACTION_SOURCES.SMS,
  TRANSACTION_SOURCES.API,
] as const;

const sortFieldValues = Object.keys(TRANSACTION_SORT_FIELDS) as [string, ...string[]];

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number({ required_error: 'Amount is required' })
      .positive('Amount must be greater than zero'),
    transactionType: z.enum(transactionTypeValues, {
      required_error: 'Transaction type is required',
    }),
    categoryId: z.string({ required_error: 'Category ID is required' })
      .uuid('Category ID must be a valid UUID'),
    merchantName: z.string().max(255, 'Merchant name must not exceed 255 characters').optional(),
    paymentMethod: z.enum(paymentMethodValues).optional(),
    source: z.enum(transactionSourceValues).optional().default(TRANSACTION_SOURCES.MANUAL),
    transactionDate: z.string({ required_error: 'Transaction date is required' })
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid transaction date' }),
    notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
    description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be greater than zero').optional(),
    transactionType: z.enum(transactionTypeValues).optional(),
    categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
    merchantName: z.string().max(255, 'Merchant name must not exceed 255 characters').optional(),
    paymentMethod: z.enum(paymentMethodValues).optional(),
    transactionDate: z.string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid transaction date' })
      .optional(),
    notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
    description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  }),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a positive integer')
      .transform(Number)
      .refine((n) => n >= 1, 'Page must be at least 1')
      .optional()
      .default(String(TRANSACTION_DEFAULT_PAGE)),
    limit: z.string().regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine((n) => n >= 1 && n <= TRANSACTION_MAX_LIMIT, `Limit must be between 1 and ${TRANSACTION_MAX_LIMIT}`)
      .optional()
      .default(String(TRANSACTION_DEFAULT_LIMIT)),
    search: z.string().max(255).optional(),
    categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
    type: z.enum(transactionTypeValues).optional(),
    paymentMethod: z.enum(paymentMethodValues).optional(),
    source: z.enum(transactionSourceValues).optional(),
    from: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid from date' }).optional(),
    to: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid to date' }).optional(),
    minAmount: z.string().regex(/^\d+(\.\d+)?$/, 'minAmount must be a positive number').transform(Number).optional(),
    maxAmount: z.string().regex(/^\d+(\.\d+)?$/, 'maxAmount must be a positive number').transform(Number).optional(),
    sort: z.enum(sortFieldValues).optional().default(TRANSACTION_SORT_FIELDS['transaction_date']),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const monthlyQuerySchema = z.object({
  query: z.object({
    month: z.string().regex(/^\d+$/, 'Month must be a number')
      .transform(Number)
      .refine((n) => n >= 1 && n <= 12, 'Month must be between 1 and 12')
      .optional(),
    year: z.string().regex(/^\d+$/, 'Year must be a number')
      .transform(Number)
      .refine((n) => n >= 2000 && n <= 2100, 'Year must be a valid year')
      .optional(),
  }),
});
