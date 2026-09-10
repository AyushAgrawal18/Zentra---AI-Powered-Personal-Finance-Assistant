import { NotFoundError } from "../../src/common/errors";
import { reportRepository } from "../../src/modules/reports/repositories";
import {
  downloadReportService,
  generateReportService,
  getReportService,
  listReportsService,
} from "../../src/modules/reports/services";

jest.mock("../../src/modules/reports/repositories");
const repo = reportRepository;
const record = {
  id: "99999999-9999-4999-8999-999999999999",
  user_id: "22222222-2222-4222-8222-222222222222",
  report_type: "MONTHLY_SUMMARY",
  parameters: { format: "CSV", month: 8, year: 2026 },
  file_url: "/api/v1/reports/99999999-9999-4999-8999-999999999999/download",
  created_at: new Date("2026-09-10T10:00:00.000Z"),
};

beforeEach(() => {
  jest.clearAllMocks();
  (repo.create as jest.Mock).mockResolvedValue(record);
  (repo.updateSnapshot as jest.Mock).mockResolvedValue(record);
  (repo.findById as jest.Mock).mockResolvedValue(record);
  (repo.list as jest.Mock).mockResolvedValue({ rows: [record], total: 1 });
  (repo.getSummary as jest.Mock).mockResolvedValue({
    transactionCount: 3,
    income: 10000,
    expense: 4000,
  });
  (repo.getCategories as jest.Mock).mockResolvedValue([
    { category: "Food", amount: 4000, count: 2 },
  ]);
  (repo.getTransactions as jest.Mock).mockResolvedValue([]);
});

describe("Report services", () => {
  it("generates a summary with net savings and stores an immutable snapshot", async () => {
    const result = await generateReportService("user-1", {
      reportType: "MONTHLY_SUMMARY",
      format: "CSV",
      month: 8,
      year: 2026,
    });
    expect(result.status).toBe("COMPLETED");
    expect(result.downloadUrl).toContain("/download");
    expect(repo.getSummary).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ month: 8, year: 2026 }),
    );
    expect(repo.updateSnapshot).toHaveBeenCalled();
  });

  it("generates category percentages and handles empty data", async () => {
    (repo.getCategories as jest.Mock).mockResolvedValue([]);
    const result = await generateReportService("user-1", {
      reportType: "CATEGORY_SPENDING",
      format: "CSV",
    });
    expect(result.status).toBe("COMPLETED");
    const snapshot = (repo.updateSnapshot as jest.Mock).mock.calls[0][2];
    expect(snapshot.generatedData.rows).toEqual([]);
  });

  it("generates a PDF download", async () => {
    (repo.findById as jest.Mock).mockResolvedValue({
      ...record,
      parameters: {
        format: "PDF",
        generatedData: {
          reportType: "MONTHLY_SUMMARY",
          filters: {},
          summary: {
            income: 1,
            expense: 0,
            transactionCount: 1,
            netSavings: 1,
            savingsRate: 100,
          },
        },
      },
    });
    const result = await downloadReportService(record.id, "user-1");
    expect(result.format).toBe("PDF");
    expect(result.content.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("protects report ownership and returns paginated history", async () => {
    (repo.findById as jest.Mock).mockResolvedValue(null);
    await expect(getReportService(record.id, "other-user")).rejects.toThrow(
      NotFoundError,
    );
    (repo.findById as jest.Mock).mockResolvedValue(record);
    const result = await listReportsService("user-1", {
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
