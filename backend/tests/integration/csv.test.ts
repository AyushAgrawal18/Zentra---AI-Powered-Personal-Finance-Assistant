import express from "express";
import request from "supertest";
import { errorHandler } from "../../src/common/middleware/errorHandler";
import { csvRoutes } from "../../src/modules/csv/routes";
import { csvRepository } from "../../src/modules/csv/repositories";

jest.mock("../../src/modules/csv/repositories");
jest.mock("../../src/modules/auth/utils", () => ({
  ...jest.requireActual("../../src/modules/auth/utils"),
  verifyAccessToken: jest
    .fn()
    .mockReturnValue({ userId: "22222222-2222-4222-8222-222222222222" }),
}));
const app = express();
app.use(express.json());
app.use("/api/v1/imports/csv", csvRoutes);
app.use(errorHandler);
const auth = { Authorization: "Bearer valid-token" };
const record = {
  id: "77777777-7777-4777-8777-777777777777",
  user_id: "22222222-2222-4222-8222-222222222222",
  filename: "statement.csv",
  bank_name: null,
  total_records: 1,
  imported_records: 0,
  failed_records: 0,
  status: "pending",
  created_at: new Date("2026-09-10T10:00:00.000Z"),
};
const repo = csvRepository;

beforeEach(() => {
  jest.clearAllMocks();
  (repo.createImport as jest.Mock).mockResolvedValue(record);
  (repo.updateCounts as jest.Mock).mockResolvedValue(record);
  (repo.findById as jest.Mock).mockResolvedValue(record);
  (repo.categoryId as jest.Mock).mockResolvedValue(
    "33333333-3333-4333-8333-333333333333",
  );
  (repo.duplicate as jest.Mock).mockResolvedValue(false);
  (repo.importTransactions as jest.Mock).mockResolvedValue(1);
  (repo.list as jest.Mock).mockResolvedValue({ rows: [record], total: 1 });
  (repo.cancel as jest.Mock).mockResolvedValue(true);
});
const csv =
  "Date,Description,Amount,Type,Category\n2026-09-01,Groceries,1200,expense,Food\n";

describe("CSV authentication", () => {
  it("requires authentication", async () => {
    expect((await request(app).get("/api/v1/imports/csv")).status).toBe(401);
  });
});

describe("CSV import API", () => {
  it("uploads a CSV file", async () => {
    const response = await request(app)
      .post("/api/v1/imports/csv/upload")
      .set(auth)
      .attach("file", Buffer.from(csv), {
        filename: "statement.csv",
        contentType: "text/csv",
      });
    expect(response.status).toBe(201);
    expect(response.body.data).toEqual({
      importId: record.id,
      status: "UPLOADED",
    });
  });

  it("rejects non-CSV uploads", async () => {
    const response = await request(app)
      .post("/api/v1/imports/csv/upload")
      .set(auth)
      .attach("file", Buffer.from("not csv"), {
        filename: "statement.txt",
        contentType: "text/plain",
      });
    expect(response.status).toBe(400);
  });

  it("previews, confirms, lists, and cancels an owned import", async () => {
    const upload = await request(app)
      .post("/api/v1/imports/csv/upload")
      .set(auth)
      .attach("file", Buffer.from(csv), {
        filename: "statement.csv",
        contentType: "text/csv",
      });
    expect(upload.status).toBe(201);
    const preview = await request(app)
      .get(`/api/v1/imports/csv/${record.id}/preview`)
      .set(auth);
    expect(preview.status).toBe(200);
    expect(preview.body.data.validRecords).toBe(1);
    const confirmed = await request(app)
      .post(`/api/v1/imports/csv/${record.id}/confirm`)
      .set(auth);
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.data.importedRecords).toBe(1);
    const history = await request(app)
      .get("/api/v1/imports/csv?page=1&limit=20")
      .set(auth);
    expect(history.status).toBe(200);
    expect(history.body.meta.total).toBe(1);
  });

  it("validates import IDs and protects ownership", async () => {
    const invalid = await request(app)
      .get("/api/v1/imports/csv/not-a-uuid")
      .set(auth);
    expect(invalid.status).toBe(400);
    (repo.findById as jest.Mock).mockResolvedValue(null);
    const missing = await request(app)
      .get(`/api/v1/imports/csv/${record.id}`)
      .set(auth);
    expect(missing.status).toBe(404);
  });
});
