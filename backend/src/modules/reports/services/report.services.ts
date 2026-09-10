import PDFDocument from "pdfkit";
import { NotFoundError } from "../../../common/errors";
import { logger } from "../../../common/logger";
import { REPORT_MESSAGES, REPORT_TYPES } from "../constants";
import {
  CreateReportDTO,
  ListReportsQueryDTO,
  ReportData,
  ReportResponseDTO,
} from "../dto";
import { reportRepository, ReportFilters } from "../repositories";
import { mapReportToDTO } from "../utils";

function filtersFrom(
  dto: CreateReportDTO | Record<string, unknown>,
): ReportFilters {
  return {
    from: dto.from as string | undefined,
    to: dto.to as string | undefined,
    month: dto.month as number | undefined,
    year: dto.year as number | undefined,
    categoryId: dto.categoryId as string | undefined,
    transactionType: dto.transactionType as string | undefined,
    paymentMethod: dto.paymentMethod as string | undefined,
  };
}

async function buildReportData(
  userId: string,
  reportType: string,
  filters: ReportFilters,
): Promise<ReportData> {
  const summary = await reportRepository.getSummary(userId, filters);
  if (reportType === REPORT_TYPES.CATEGORY_SPENDING) {
    const rows = await reportRepository.getCategories(userId, filters);
    const total = rows.reduce((sum, row) => sum + row.amount, 0);
    return {
      reportType,
      filters: { ...filters },
      summary: {
        ...summary,
        highestSpendingCategory: rows[0]?.category ?? null,
      },
      rows: rows.map((row) => ({
        ...row,
        percentage: total ? Number(((row.amount / total) * 100).toFixed(2)) : 0,
      })),
    };
  }
  if (reportType === REPORT_TYPES.TRANSACTION_REPORT) {
    return {
      reportType,
      filters: { ...filters },
      summary,
      rows: await reportRepository.getTransactions(userId, filters),
    };
  }
  if (reportType === REPORT_TYPES.BUDGET_REPORT) {
    const rows = await reportRepository.getBudgets(userId, filters);
    return {
      reportType,
      filters: { ...filters },
      summary: { budgetCount: rows.length },
      rows,
    };
  }
  if (reportType === REPORT_TYPES.GOAL_REPORT) {
    const rows = await reportRepository.getGoals(userId);
    return {
      reportType,
      filters: { ...filters },
      summary: {
        goalCount: rows.length,
        completedGoals: rows.filter((row) => row.status === "completed").length,
      },
      rows,
    };
  }
  return {
    reportType,
    filters: { ...filters },
    summary: {
      ...summary,
      netSavings: summary.income - summary.expense,
      savingsRate: summary.income
        ? Number(
            (
              ((summary.income - summary.expense) / summary.income) *
              100
            ).toFixed(2),
          )
        : 0,
    },
  };
}

function csvValue(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(data: ReportData): string {
  const lines = [`reportType,${csvValue(data.reportType)}`];
  Object.entries(data.summary).forEach(([key, value]) =>
    lines.push(`${csvValue(key)},${csvValue(value)}`),
  );
  if (data.rows?.length) {
    lines.push("");
    const headers = Object.keys(data.rows[0]);
    lines.push(headers.map(csvValue).join(","));
    data.rows.forEach((row) =>
      lines.push(headers.map((header) => csvValue(row[header])).join(",")),
    );
  }
  return `${lines.join("\n")}\n`;
}

function toPdf(data: ReportData): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    const document = new PDFDocument();
    document.on("data", (chunk) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.fontSize(18).text(`${data.reportType} Report`).moveDown();
    Object.entries(data.summary).forEach(([key, value]) =>
      document.fontSize(11).text(`${key}: ${value}`),
    );
    data.rows?.forEach((row) =>
      document
        .moveDown(0.25)
        .fontSize(9)
        .text(
          Object.entries(row)
            .map(([key, value]) => `${key}=${value}`)
            .join(" | "),
        ),
    );
    document.end();
  });
}

export const generateReportService = async (
  userId: string,
  dto: CreateReportDTO,
): Promise<ReportResponseDTO> => {
  const parameters = { ...dto } as Record<string, unknown>;
  const record = await reportRepository.create(
    userId,
    dto.reportType,
    { ...parameters, format: dto.format },
    `/api/v1/reports/pending/download`,
  );
  const data = await buildReportData(userId, dto.reportType, filtersFrom(dto));
  const updatedParameters = {
    ...parameters,
    format: dto.format,
    generatedData: data,
  };
  // The existing schema has no status/file columns; parameters preserve the immutable snapshot.
  const completed = await reportRepository.updateSnapshot(
    record.id,
    userId,
    updatedParameters,
    `/api/v1/reports/${record.id}/download`,
  );
  if (!completed) throw new NotFoundError(REPORT_MESSAGES.NOT_FOUND);
  logger.info(
    { reportId: completed.id, userId, reportType: dto.reportType },
    "Report generated",
  );
  return mapReportToDTO(completed);
};

export const listReportsService = async (
  userId: string,
  query: ListReportsQueryDTO,
) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const result = await reportRepository.list(
    userId,
    page,
    limit,
    query.reportType ?? query.type,
    query.format,
  );
  return {
    data: result.rows.map(mapReportToDTO),
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit) || 1,
    },
  };
};

export const getReportService = async (
  id: string,
  userId: string,
): Promise<ReportResponseDTO> => {
  const record = await reportRepository.findById(id, userId);
  if (!record) throw new NotFoundError(REPORT_MESSAGES.NOT_FOUND);
  return mapReportToDTO(record);
};

export const downloadReportService = async (
  id: string,
  userId: string,
): Promise<{ content: Buffer; format: string; filename: string }> => {
  const record = await reportRepository.findById(id, userId);
  if (!record) throw new NotFoundError(REPORT_MESSAGES.NOT_FOUND);
  const parameters = record.parameters ?? {};
  const data =
    (parameters.generatedData as ReportData | undefined) ??
    (await buildReportData(
      userId,
      record.report_type,
      filtersFrom(parameters),
    ));
  const format = String(parameters.format ?? "CSV");
  return {
    content:
      format === "PDF" ? await toPdf(data) : Buffer.from(toCsv(data), "utf8"),
    format,
    filename: `${record.report_type.toLowerCase()}.${format.toLowerCase()}`,
  };
};

export const deleteReportService = async (
  id: string,
  userId: string,
): Promise<void> => {
  if (!(await reportRepository.delete(id, userId)))
    throw new NotFoundError(REPORT_MESSAGES.NOT_FOUND);
};
