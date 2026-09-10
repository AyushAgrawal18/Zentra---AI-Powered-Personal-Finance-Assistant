import { parse } from "csv-parse/sync";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../../common/errors";
import { logger } from "../../../common/logger";
import { CSV_MESSAGES, IMPORT_STATUSES } from "../constants";
import {
  CsvImportRecord,
  CsvRow,
  CsvRowResult,
  ImportPreviewDTO,
  ImportSummaryDTO,
  ListImportsQueryDTO,
  PaginationMeta,
} from "../dto";
import { csvRepository } from "../repositories";

const pendingRows = new Map<string, CsvRow[]>();
const requiredHeaders = ["date", "description", "amount", "type"];

function headerKey(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}

function parseRows(buffer: Buffer): CsvRow[] {
  const text = buffer.toString("utf8");
  if (!text.trim()) throw new ValidationError(CSV_MESSAGES.INVALID_FILE);
  let records: Record<string, string>[];
  try {
    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      relax_column_count: true,
    }) as Record<string, string>[];
  } catch {
    throw new ValidationError(
      "CSV could not be parsed. Check its encoding and delimiters.",
    );
  }
  if (records.length === 0)
    throw new ValidationError(CSV_MESSAGES.INVALID_FILE);
  const headers = Object.keys(records[0]).reduce<Record<string, string>>(
    (result, key) => {
      result[headerKey(key)] = key;
      return result;
    },
    {},
  );
  const missing = requiredHeaders.filter((header) => !headers[header]);
  if (missing.length)
    throw new ValidationError(
      `Missing required CSV columns: ${missing.join(", ")}`,
    );

  return records.map((record, index) => {
    const value = (key: string) => (record[headers[key]] ?? "").trim();
    const rawAmount = value("amount").replace(/,/g, "");
    const type = value("type").toLowerCase();
    return {
      rowNumber: index + 2,
      transactionDate: value("date"),
      description: value("description"),
      amount: Number(rawAmount),
      transactionType: type as CsvRow["transactionType"],
      categoryValue: value("category") || undefined,
      reference: value("reference") || undefined,
    };
  });
}

async function inspectRows(
  userId: string,
  rows: CsvRow[],
): Promise<CsvRowResult[]> {
  return Promise.all(
    rows.map(async (row) => {
      const errors: string[] = [];
      const parsedDate = new Date(row.transactionDate);
      if (!row.transactionDate || Number.isNaN(parsedDate.getTime()))
        errors.push("Invalid date");
      if (!Number.isFinite(row.amount) || row.amount <= 0)
        errors.push("Amount must be greater than zero");
      if (!row.description) errors.push("Description is required");
      if (!["income", "expense", "transfer"].includes(row.transactionType))
        errors.push("Type must be income, expense, or transfer");
      const [year, month, day] = row.transactionDate.split("-").map(Number);
      const validCalendarDate =
        /^\d{4}-\d{2}-\d{2}$/.test(row.transactionDate) &&
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() === month - 1 &&
        parsedDate.getUTCDate() === day;
      if (!validCalendarDate && !errors.includes("Invalid date")) {
        errors.push("Invalid date");
      }
      let categoryId: string | undefined;
      if (!row.categoryValue) {
        errors.push(
          "Category is required because transactions require a category",
        );
      } else if (
        !errors.includes("Type must be income, expense, or transfer")
      ) {
        categoryId =
          (await csvRepository.categoryId(
            userId,
            row.categoryValue,
            row.transactionType,
          )) ?? undefined;
        if (!categoryId)
          errors.push("Category does not exist or is not accessible");
      }
      const duplicate =
        errors.length === 0
          ? await csvRepository.duplicate(userId, {
              date: parsedDate,
              amount: row.amount,
              merchant: row.description,
              type: row.transactionType,
            })
          : false;
      return {
        ...row,
        valid: errors.length === 0,
        duplicate,
        errors,
        categoryId,
      };
    }),
  );
}

export const uploadCsvService = async (
  userId: string,
  filename: string,
  buffer: Buffer,
): Promise<CsvImportRecord> => {
  const rows = parseRows(buffer);
  const record = await csvRepository.createImport(userId, filename);
  pendingRows.set(record.id, rows);
  await csvRepository.updateCounts(
    record.id,
    userId,
    IMPORT_STATUSES.PENDING,
    rows.length,
    0,
    0,
  );
  logger.info(
    { importId: record.id, userId, totalRecords: rows.length },
    "CSV uploaded",
  );
  return { ...record, total_records: rows.length };
};

export const previewCsvService = async (
  id: string,
  userId: string,
): Promise<ImportPreviewDTO> => {
  const record = await csvRepository.findById(id, userId);
  if (!record) throw new NotFoundError(CSV_MESSAGES.NOT_FOUND);
  const rows = pendingRows.get(id);
  if (!rows)
    throw new ValidationError("CSV rows are no longer available for preview");
  const preview = await inspectRows(userId, rows);
  const validRecords = preview.filter(
    (row) => row.valid && !row.duplicate,
  ).length;
  return {
    totalRecords: preview.length,
    validRecords,
    duplicateRecords: preview.filter((row) => row.duplicate).length,
    invalidRecords: preview.filter((row) => !row.valid).length,
    preview,
  };
};

export const confirmCsvService = async (
  id: string,
  userId: string,
): Promise<ImportSummaryDTO> => {
  const record = await csvRepository.findById(id, userId);
  if (!record) throw new NotFoundError(CSV_MESSAGES.NOT_FOUND);
  if (record.status !== IMPORT_STATUSES.PENDING)
    throw new ConflictError(CSV_MESSAGES.INVALID_STATUS);
  const rows = pendingRows.get(id);
  if (!rows)
    throw new ValidationError("CSV rows are no longer available for import");
  await csvRepository.updateCounts(
    id,
    userId,
    IMPORT_STATUSES.PROCESSING,
    rows.length,
    0,
    0,
  );
  const preview = await inspectRows(userId, rows);
  const importable = preview
    .filter((row) => row.valid && !row.duplicate && row.categoryId)
    .map((row) => ({
      categoryId: row.categoryId!,
      amount: row.amount,
      type: row.transactionType,
      merchant: row.description,
      date: new Date(row.transactionDate),
      notes: row.reference ?? row.description,
    }));
  let importedRecords: number;
  try {
    importedRecords = await csvRepository.importTransactions(
      userId,
      importable,
    );
  } catch (error) {
    await csvRepository.updateCounts(
      id,
      userId,
      IMPORT_STATUSES.FAILED,
      rows.length,
      0,
      rows.length,
    );
    throw error;
  }
  const summary = {
    status: IMPORT_STATUSES.COMPLETED.toUpperCase() as "COMPLETED",
    importedRecords,
    duplicateRecords: preview.filter((row) => row.duplicate).length,
    failedRecords: preview.filter((row) => !row.valid).length,
  };
  await csvRepository.updateCounts(
    id,
    userId,
    IMPORT_STATUSES.COMPLETED,
    rows.length,
    importedRecords,
    summary.failedRecords,
  );
  pendingRows.delete(id);
  logger.info(
    { importId: id, userId, importedRecords },
    "CSV import completed",
  );
  return summary;
};

export const listCsvService = async (
  userId: string,
  query: ListImportsQueryDTO,
): Promise<{ data: CsvImportRecord[]; meta: PaginationMeta }> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const result = await csvRepository.list(userId, page, limit, query.status);
  return {
    data: result.rows,
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit) || 1,
    },
  };
};

export const getCsvService = async (
  id: string,
  userId: string,
): Promise<CsvImportRecord> => {
  const record = await csvRepository.findById(id, userId);
  if (!record) throw new NotFoundError(CSV_MESSAGES.NOT_FOUND);
  return record;
};

export const cancelCsvService = async (
  id: string,
  userId: string,
): Promise<void> => {
  const record = await csvRepository.findById(id, userId);
  if (!record) throw new NotFoundError(CSV_MESSAGES.NOT_FOUND);
  if (record.status !== IMPORT_STATUSES.PENDING)
    throw new ConflictError(CSV_MESSAGES.INVALID_STATUS);
  const cancelled = await csvRepository.cancel(id, userId);
  if (!cancelled) throw new NotFoundError(CSV_MESSAGES.NOT_FOUND);
  pendingRows.delete(id);
  logger.info({ importId: id, userId }, "CSV import cancelled");
};
