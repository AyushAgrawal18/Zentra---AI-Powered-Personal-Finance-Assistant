import express from "express";
import request from "supertest";
import { errorHandler } from "../../src/common/middleware/errorHandler";
import { paymentRoutes } from "../../src/modules/payments/routes";
import { paymentRepository } from "../../src/modules/payments/repositories";

jest.mock("../../src/modules/payments/repositories");
jest.mock("../../src/modules/auth/utils", () => ({
  ...jest.requireActual("../../src/modules/auth/utils"),
  verifyAccessToken: jest
    .fn()
    .mockReturnValue({ userId: "22222222-2222-4222-8222-222222222222" }),
}));

const app = express();
app.use(express.json());
app.use("/api/v1/payments", paymentRoutes);
app.use(errorHandler);
const auth = { Authorization: "Bearer valid-token" };
const payment = {
  id: "66666666-6666-4666-8666-666666666666",
  user_id: "22222222-2222-4222-8222-222222222222",
  amount: "1200.00",
  merchant_name: "ABC Supermarket",
  upi_id: "merchant@upi",
  status: "pending",
  payment_reference: "UPI-reference-1",
  created_at: new Date("2026-09-10T10:00:00.000Z"),
  updated_at: new Date("2026-09-10T10:00:00.000Z"),
};
const repo = paymentRepository;

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

describe("Payments authentication", () => {
  it("requires authentication", async () => {
    expect((await request(app).get("/api/v1/payments")).status).toBe(401);
  });
});

describe("Payments API", () => {
  it("initiates a payment intent", async () => {
    const response = await request(app)
      .post("/api/v1/payments/initiate")
      .set(auth)
      .send({
        merchantName: "ABC Supermarket",
        upiId: "merchant@upi",
        amount: 1200,
        description: "Groceries",
      });
    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("PENDING");
    expect(response.body.data.upiDeepLink).toContain("upi://pay?");
  });

  it("validates amount and UPI ID", async () => {
    const response = await request(app)
      .post("/api/v1/payments/initiate")
      .set(auth)
      .send({
        merchantName: "Shop",
        upiId: "invalid",
        amount: 0,
      });
    expect(response.status).toBe(400);
  });

  it("lists payments with filters", async () => {
    const response = await request(app)
      .get("/api/v1/payments?status=COMPLETED&page=2&limit=10")
      .set(auth);
    expect(response.status).toBe(200);
    expect(response.body.meta).toEqual({
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({ status: "COMPLETED", page: 2, limit: 10 }),
    );
  });

  it("protects payment details by ownership", async () => {
    (repo.findById as jest.Mock).mockResolvedValue(null);
    const response = await request(app)
      .get(`/api/v1/payments/${payment.id}`)
      .set(auth);
    expect(response.status).toBe(404);
  });

  it("reconciles a successful payment", async () => {
    const response = await request(app)
      .post(`/api/v1/payments/${payment.id}/reconcile`)
      .set(auth)
      .send({
        outcome: "SUCCESS",
        categoryId: "33333333-3333-4333-8333-333333333333",
      });
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      paymentId: payment.id,
      status: "COMPLETED",
      transactionId: "txn-1",
    });
  });

  it("rejects successful reconciliation without a category", async () => {
    const response = await request(app)
      .post(`/api/v1/payments/${payment.id}/reconcile`)
      .set(auth)
      .send({ outcome: "SUCCESS" });
    expect(response.status).toBe(400);
  });

  it("cancels a pending payment", async () => {
    const response = await request(app)
      .delete(`/api/v1/payments/${payment.id}`)
      .set(auth);
    expect(response.status).toBe(200);
    expect(repo.cancelPending).toHaveBeenCalledWith(
      payment.id,
      "22222222-2222-4222-8222-222222222222",
    );
  });
});
