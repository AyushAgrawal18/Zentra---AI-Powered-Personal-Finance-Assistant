import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../src/common/errors";
import { paymentRepository } from "../../src/modules/payments/repositories";
import {
  cancelPaymentService,
  getPaymentService,
  initiatePaymentService,
  listPaymentsService,
  reconcilePaymentService,
} from "../../src/modules/payments/services";

jest.mock("../../src/modules/payments/repositories");

const repo = paymentRepository;
const payment = {
  id: "66666666-6666-4666-8666-666666666666",
  user_id: "22222222-2222-4222-8222-222222222222",
  amount: "1200.00",
  merchant_name: "ABC Supermarket",
  upi_id: "merchant@upi",
  status: "pending" as const,
  payment_reference: "UPI-reference-1",
  created_at: new Date("2026-09-10T10:00:00.000Z"),
  updated_at: new Date("2026-09-10T10:00:00.000Z"),
};

beforeEach(() => {
  jest.clearAllMocks();
  (repo.createPaymentIntent as jest.Mock).mockResolvedValue(payment);
  (repo.findByReference as jest.Mock).mockResolvedValue(null);
  (repo.findById as jest.Mock).mockResolvedValue(payment);
  (repo.list as jest.Mock).mockResolvedValue({ rows: [payment], total: 1 });
  (repo.reconcile as jest.Mock).mockResolvedValue({
    payment: { ...payment, status: "completed" },
    transactionId: "txn-1",
  });
  (repo.cancelPending as jest.Mock).mockResolvedValue(true);
});

describe("Payments services", () => {
  it("creates a payment intent and generates a UPI deep link", async () => {
    const result = await initiatePaymentService("user-1", {
      merchantName: "ABC Supermarket",
      upiId: "merchant@upi",
      amount: 1200,
      description: "Groceries",
    });
    expect(result.status).toBe("PENDING");
    expect(result.upiDeepLink).toContain("upi://pay?");
    expect(result.upiDeepLink).toContain("pa=merchant%40upi");
    expect(repo.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", amount: 1200 }),
    );
  });

  it("reuses an idempotent initiation key", async () => {
    (repo.findByReference as jest.Mock).mockResolvedValue(payment);
    const result = await initiatePaymentService(
      "user-1",
      {
        merchantName: "ABC Supermarket",
        upiId: "merchant@upi",
        amount: 1200,
      },
      "request-key",
    );
    expect(result.id).toBe(payment.id);
    expect(repo.createPaymentIntent).not.toHaveBeenCalled();
  });

  it("lists user payments with pagination metadata", async () => {
    const result = await listPaymentsService("user-1", {
      page: 2,
      limit: 10,
    } as any);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", page: 2, limit: 10 }),
    );
  });

  it("returns not found for another user payment", async () => {
    (repo.findById as jest.Mock).mockResolvedValue(null);
    await expect(getPaymentService(payment.id, "other-user")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("reconciles a successful payment into a transaction", async () => {
    const result = await reconcilePaymentService(payment.id, "user-1", {
      outcome: "SUCCESS",
      categoryId: "33333333-3333-4333-8333-333333333333",
    });
    expect(result).toEqual({
      paymentId: payment.id,
      status: "COMPLETED",
      transactionId: "txn-1",
    });
  });

  it("rejects duplicate reconciliation", async () => {
    (repo.reconcile as jest.Mock).mockRejectedValue(
      new Error("PAYMENT_ALREADY_RECONCILED"),
    );
    await expect(
      reconcilePaymentService(payment.id, "user-1", {
        outcome: "FAILED",
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("rejects invalid reconciliation category", async () => {
    (repo.reconcile as jest.Mock).mockRejectedValue(
      new Error("INVALID_CATEGORY"),
    );
    await expect(
      reconcilePaymentService(payment.id, "user-1", {
        outcome: "SUCCESS",
        categoryId: "33333333-3333-4333-8333-333333333333",
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("cancels only pending payments", async () => {
    await expect(
      cancelPaymentService(payment.id, "user-1"),
    ).resolves.toBeUndefined();
    expect(repo.cancelPending).toHaveBeenCalledWith(payment.id, "user-1");
    (repo.findById as jest.Mock).mockResolvedValue({
      ...payment,
      status: "completed",
    });
    await expect(cancelPaymentService(payment.id, "user-1")).rejects.toThrow(
      ConflictError,
    );
  });
});
