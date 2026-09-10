import { z } from "zod";
import {
  initiatePaymentSchema,
  listPaymentsSchema,
  reconcilePaymentSchema,
} from "../validators";

export type InitiatePaymentDTO = z.infer<typeof initiatePaymentSchema>["body"];
export type ListPaymentsQueryDTO = z.infer<typeof listPaymentsSchema>["query"];
export type ReconcilePaymentDTO = z.infer<
  typeof reconcilePaymentSchema
>["body"];

export interface PaymentRecord {
  id: string;
  user_id: string;
  amount: string;
  merchant_name: string;
  upi_id: string;
  status: "pending" | "completed" | "failed";
  payment_reference: string;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentResponseDTO {
  id: string;
  userId: string;
  amount: number;
  merchantName: string;
  upiId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paymentReference: string;
  upiDeepLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReconcileResponseDTO {
  paymentId: string;
  status: "COMPLETED" | "FAILED";
  transactionId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
