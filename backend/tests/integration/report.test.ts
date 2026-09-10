import express from "express";
import request from "supertest";
import { errorHandler } from "../../src/common/middleware/errorHandler";
import { reportRoutes } from "../../src/modules/reports/routes";
import { reportRepository } from "../../src/modules/reports/repositories";

jest.mock("../../src/modules/reports/repositories");
jest.mock("../../src/modules/auth/utils", () => ({
  ...jest.requireActual("../../src/modules/auth/utils"),
  verifyAccessToken: jest
    .fn()
    .mockReturnValue({ userId: "22222222-2222-4222-8222-222222222222" }),
}));
const app = express();
app.use(express.json());
app.use("/api/v1/reports", reportRoutes);
app.use(errorHandler);
const auth = { Authorization: "Bearer valid-token" };
const record = {
  id: "99999999-9999-4999-8999-999999999999",
  user_id: "22222222-2222-4222-8222-222222222222",
  report_type: "MONTHLY_SUMMARY",
  parameters: {
    format: "CSV",
    generatedData: {
      reportType: "MONTHLY_SUMMARY",
      filters: {},
      summary: {
        income: 100,
        expense: 20,
        netSavings: 80,
        transactionCount: 1,
        savingsRate: 80,
      },
    },
  },
  file_url: "/api/v1/reports/99999999-9999-4999-8999-999999999999/download",
  created_at: new Date("2026-09-10T10:00:00.000Z"),
};
const repo = reportRepository;

beforeEach(() => {
  jest.clearAllMocks();
  (repo.create as jest.Mock).mockResolvedValue(record);
  (repo.updateSnapshot as jest.Mock).mockResolvedValue(record);
  (repo.findById as jest.Mock).mockResolvedValue(record);
  (repo.list as jest.Mock).mockResolvedValue({ rows: [record], total: 1 });
  (repo.getSummary as jest.Mock).mockResolvedValue({
    transactionCount: 1,
    income: 100,
    expense: 20,
  });
  (repo.getCategories as jest.Mock).mockResolvedValue([]);
  (repo.getTransactions as jest.Mock).mockResolvedValue([]);
  (repo.delete as jest.Mock).mockResolvedValue(true);
});

describe("Reports authentication", () => {
  it("requires authentication", async () => {
    expect((await request(app).get("/api/v1/reports")).status).toBe(401);
  });
});

describe("Reports API", () => {
  it("generates, lists, retrieves, and downloads a CSV report", async () => {
    const generated = await request(app)
      .post("/api/v1/reports")
      .set(auth)
      .send({
        reportType: "MONTHLY_SUMMARY",
        format: "CSV",
        month: 8,
        year: 2026,
      });
    expect(generated.status).toBe(202);
    expect(generated.body.data.status).toBe("COMPLETED");
    const list = await request(app)
      .get("/api/v1/reports?reportType=MONTHLY_SUMMARY&format=CSV")
      .set(auth);
    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(1);
    const details = await request(app)
      .get(`/api/v1/reports/${record.id}`)
      .set(auth);
    expect(details.status).toBe(200);
    const download = await request(app)
      .get(`/api/v1/reports/${record.id}/download`)
      .set(auth);
    expect(download.status).toBe(200);
    expect(download.headers["content-type"]).toContain("text/csv");
  });

  it("validates report types and ownership", async () => {
    const invalid = await request(app)
      .post("/api/v1/reports")
      .set(auth)
      .send({ reportType: "UNKNOWN", format: "CSV" });
    expect(invalid.status).toBe(400);
    (repo.findById as jest.Mock).mockResolvedValue(null);
    const missing = await request(app)
      .get(`/api/v1/reports/${record.id}`)
      .set(auth);
    expect(missing.status).toBe(404);
  });

  it("deletes an owned report and rejects invalid IDs", async () => {
    expect(
      (await request(app).delete(`/api/v1/reports/${record.id}`).set(auth))
        .status,
    ).toBe(200);
    expect(
      (await request(app).get("/api/v1/reports/not-a-uuid").set(auth)).status,
    ).toBe(400);
  });
});
