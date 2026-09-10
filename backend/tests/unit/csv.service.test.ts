import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../src/common/errors";
import { csvRepository } from "../../src/modules/csv/repositories";
import {
  cancelCsvService,
  confirmCsvService,
  listCsvService,
  previewCsvService,
  uploadCsvService,
} from "../../src/modules/csv/services";

jest.mock("../../src/modules/csv/repositories");
const repo = csvRepository;
const record = {
  id: "77777777-7777-4777-8777-777777777777",
  user_id: "22222222-2222-4222-8222-222222222222",
  filename: "statement.csv",
  bank_name: null,
  total_records: 0,
  imported_records: 0,
  failed_records: 0,
  status: "pending" as const,
  created_at: new Date("2026-09-10T10:00:00.000Z"),
};
const csv = Buffer.from(
  "Date,Description,Amount,Type,Category\n2026-09-01,Groceries,1200,expense,Food\n2026-09-02,Salary,50000,income,Salary\n",
);

beforeEach(() => {
  jest.clearAllMocks();
  (repo.createImport as jest.Mock).mockResolvedValue(record);
  (repo.updateCounts as jest.Mock).mockResolvedValue(record);
  (repo.findById as jest.Mock).mockResolvedValue(record);
  (repo.categoryId as jest.Mock).mockResolvedValue(
    "33333333-3333-4333-8333-333333333333",
  );
  (repo.duplicate as jest.Mock).mockResolvedValue(false);
  (repo.importTransactions as jest.Mock).mockResolvedValue(2);
  (repo.list as jest.Mock).mockResolvedValue({ rows: [record], total: 1 });
  (repo.cancel as jest.Mock).mockResolvedValue(true);
});

describe("CSV services", () => {
  it("uploads and parses a valid CSV", async () => {
    const result = await uploadCsvService("user-1", "statement.csv", csv);
    expect(result.total_records).toBe(2);
    expect(repo.createImport).toHaveBeenCalledWith("user-1", "statement.csv");
  });

  it("rejects CSV files without required columns", async () => {
    await expect(
      uploadCsvService(
        "user-1",
        "bad.csv",
        Buffer.from("Date,Amount\n2026-09-01,10"),
      ),
    ).rejects.toThrow(ValidationError);
    expect(repo.createImport).not.toHaveBeenCalled();
  });

  it("previews invalid rows and duplicates without importing them", async () => {
    const imported = await uploadCsvService("user-1", "statement.csv", csv);
    (repo.duplicate as jest.Mock)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const preview = await previewCsvService(imported.id, "user-1");
    expect(preview.totalRecords).toBe(2);
    expect(preview.duplicateRecords).toBe(1);
    expect(preview.validRecords).toBe(1);
  });

  it("confirms only valid non-duplicate rows", async () => {
    await uploadCsvService("user-1", "statement.csv", csv);
    const summary = await confirmCsvService(record.id, "user-1");
    expect(summary.importedRecords).toBe(2);
    expect(repo.importTransactions).toHaveBeenCalledWith(
      "user-1",
      expect.arrayContaining([
        expect.objectContaining({ type: "expense", amount: 1200 }),
      ]),
    );
  });

  it("protects import ownership", async () => {
    (repo.findById as jest.Mock).mockResolvedValue(null);
    await expect(previewCsvService(record.id, "other-user")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("rejects confirmation of a completed import and cancellation of completed imports", async () => {
    (repo.findById as jest.Mock).mockResolvedValue({
      ...record,
      status: "completed",
    });
    await expect(confirmCsvService(record.id, "user-1")).rejects.toThrow(
      ConflictError,
    );
    await expect(cancelCsvService(record.id, "user-1")).rejects.toThrow(
      ConflictError,
    );
  });

  it("returns paginated import history", async () => {
    const result = await listCsvService("user-1", {
      page: 2,
      limit: 10,
    } as any);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });
});
