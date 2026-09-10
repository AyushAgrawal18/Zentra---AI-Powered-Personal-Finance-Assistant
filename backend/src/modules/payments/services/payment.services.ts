import { randomUUID } from "node:crypto";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../common/errors";
import { logger } from "../../../common/logger";
import { PAYMENT_MESSAGES, PAYMENT_STATUSES } from "../constants";
import {
  InitiatePaymentDTO,
  ListPaymentsQueryDTO,
  PaymentResponseDTO,
  ReconcilePaymentDTO,
  ReconcileResponseDTO,
  PaginationMeta,
} from "../dto";
import { paymentRepository } from "../repositories";
import { buildUpiDeepLink, mapPaymentRecordToDTO } from "../utils";

export const initiatePaymentService = async (
  userId: string,
  dto: InitiatePaymentDTO,
  idempotencyKey?: string,
): Promise<PaymentResponseDTO> => {
  const paymentReference = idempotencyKey
    ? `IDEMPOTENCY-${idempotencyKey}`
    : `UPI-${randomUUID()}`;
  if (idempotencyKey) {
    const existing = await paymentRepository.findByReference(
      paymentReference,
      userId,
    );
    if (existing) return mapPaymentRecordToDTO(existing, buildUpiDeepLink(dto));
  }

  const record = await paymentRepository.createPaymentIntent({
    userId,
    amount: dto.amount,
    merchantName: dto.merchantName,
    upiId: dto.upiId,
    paymentReference,
  });
  logger.info({ paymentId: record.id, userId }, "Payment intent created");
  return mapPaymentRecordToDTO(record, buildUpiDeepLink(dto));
};

export const listPaymentsService = async (
  userId: string,
  query: ListPaymentsQueryDTO,
): Promise<{ data: PaymentResponseDTO[]; meta: PaginationMeta }> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const result = await paymentRepository.list({
    userId,
    page,
    limit,
    status: query.status,
    from: query.from,
    to: query.to,
    sort: query.sort,
    order: query.order,
  });
  return {
    data: result.rows.map((record) => mapPaymentRecordToDTO(record)),
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit) || 1,
    },
  };
};

export const getPaymentService = async (
  id: string,
  userId: string,
): Promise<PaymentResponseDTO> => {
  const record = await paymentRepository.findById(id, userId);
  if (!record) throw new NotFoundError(PAYMENT_MESSAGES.NOT_FOUND);
  return mapPaymentRecordToDTO(record);
};

export const reconcilePaymentService = async (
  id: string,
  userId: string,
  dto: ReconcilePaymentDTO,
): Promise<ReconcileResponseDTO> => {
  try {
    const result = await paymentRepository.reconcile({
      id,
      userId,
      outcome: dto.outcome.toLowerCase() as "completed" | "failed",
      categoryId: dto.categoryId,
    });
    if (!result) throw new NotFoundError(PAYMENT_MESSAGES.NOT_FOUND);
    const status =
      result.payment.status === PAYMENT_STATUSES.COMPLETED
        ? "COMPLETED"
        : "FAILED";
    logger.info(
      { paymentId: id, userId, status, transactionId: result.transactionId },
      "Payment reconciled",
    );
    return {
      paymentId: id,
      status,
      ...(result.transactionId ? { transactionId: result.transactionId } : {}),
    };
  } catch (error: any) {
    if (error instanceof NotFoundError) throw error;
    if (error.message === "PAYMENT_ALREADY_RECONCILED") {
      throw new ConflictError(PAYMENT_MESSAGES.ALREADY_RECONCILED);
    }
    if (error.message === "INVALID_CATEGORY") {
      throw new ValidationError(PAYMENT_MESSAGES.INVALID_CATEGORY);
    }
    throw error;
  }
};

export const cancelPaymentService = async (
  id: string,
  userId: string,
): Promise<void> => {
  const existing = await paymentRepository.findById(id, userId);
  if (!existing) throw new NotFoundError(PAYMENT_MESSAGES.NOT_FOUND);
  if (existing.status !== PAYMENT_STATUSES.PENDING) {
    throw new ConflictError(PAYMENT_MESSAGES.NOT_PENDING);
  }
  const cancelled = await paymentRepository.cancelPending(id, userId);
  if (!cancelled) throw new NotFoundError(PAYMENT_MESSAGES.NOT_FOUND);
  logger.info({ paymentId: id, userId }, "Payment intent cancelled");
};
