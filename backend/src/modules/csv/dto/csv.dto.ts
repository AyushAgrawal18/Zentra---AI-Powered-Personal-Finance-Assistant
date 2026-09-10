import { z } from "zod";
import { listImportsSchema } from "../validators";

export type ListImportsQueryDTO = z.infer<typeof listImportsSchema>["query"];

export interface CsvImportRecord {
  id: string;
  user_id: string;
  filename: string;
  bank_name: string | null;
  total_records: number;
  imported_records: number;
  failed_records: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: Date;
}

export interface CsvRow {
  rowNumber: number;
  transactionDate: string;
  description: string;
  amount: number;
  transactionType: "income" | "expense" | "transfer";
  categoryValue?: string;
  reference?: string;
}

export interface CsvRowResult extends CsvRow {
  valid: boolean;
  duplicate: boolean;
  errors: string[];
  categoryId?: string;
}

export interface ImportPreviewDTO {
  totalRecords: number;
  validRecords: number;
  duplicateRecords: number;
  invalidRecords: number;
  preview: CsvRowResult[];
}

export interface ImportSummaryDTO {
  status: "COMPLETED" | "FAILED";
  importedRecords: number;
  duplicateRecords: number;
  failedRecords: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
