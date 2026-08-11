// Exactly match the database enum values from 002_create_enums.up.sql
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

// Exactly match payment_method enum
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  UPI: 'upi',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

// Exactly match transaction_source enum
export const TRANSACTION_SOURCES = {
  MANUAL: 'manual',
  CSV: 'csv',
  SMS: 'sms',
  API: 'api',
} as const;

export type TransactionSource = typeof TRANSACTION_SOURCES[keyof typeof TRANSACTION_SOURCES];

export const TRANSACTION_SORT_FIELDS: Record<string, string> = {
  transaction_date: 'transaction_date',
  amount: 'amount',
  created_at: 'created_at',
  merchant_name: 'merchant_name',
};

export const TRANSACTION_DEFAULT_SORT = 'transaction_date';
export const TRANSACTION_DEFAULT_ORDER = 'DESC';
export const TRANSACTION_DEFAULT_PAGE = 1;
export const TRANSACTION_DEFAULT_LIMIT = 20;
export const TRANSACTION_MAX_LIMIT = 100;

export const TRANSACTION_MESSAGES = {
  CREATED: 'Transaction created successfully.',
  UPDATED: 'Transaction updated successfully.',
  DELETED: 'Transaction deleted successfully.',
  FETCHED: 'Transaction fetched successfully.',
  LIST_FETCHED: 'Transactions fetched successfully.',
  BALANCE_FETCHED: 'Balance fetched successfully.',
  SUMMARY_FETCHED: 'Summary fetched successfully.',
  NOT_FOUND: 'Transaction not found.',
  FORBIDDEN: 'You do not have access to this transaction.',
  INVALID_CATEGORY: 'Category not found or does not belong to you.',
};
