import { z } from 'zod';
import { createReportSchema, listReportsSchema } from '../validators';

export type CreateReportDTO = z.infer<typeof createReportSchema>['body'];
export type ListReportsQueryDTO = z.infer<typeof listReportsSchema>['query'];

export interface ReportRecord {
  id: string;
  user_id: string;
  report_type: string;
  parameters: Record<string, unknown> | null;
  file_url: string;
  created_at: Date;
}

export interface ReportResponseDTO {
  id: string;
  reportType: string;
  format: string;
  status: 'COMPLETED';
  downloadUrl: string;
  parameters: Record<string, unknown>;
  createdAt: string;
}

export interface ReportData {
  reportType: string;
  filters: Record<string, unknown>;
  summary: Record<string, unknown>;
  rows?: Array<Record<string, unknown>>;
}

export interface PaginationMeta { page: number; limit: number; total: number; totalPages: number; }
