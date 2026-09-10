import { z } from "zod";
import { listInsightsSchema } from "../validators";

export type ListInsightsQueryDTO = z.infer<typeof listInsightsSchema>["query"];

export interface InsightRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  insight_type: string;
  priority: string;
  generated_at: Date;
  expires_at: Date | null;
  viewed_at: Date | null;
}

export interface InsightResponseDTO {
  id: string;
  title: string;
  summary: string;
  category: string;
  priority: string;
  generatedAt: string;
  expiresAt: string | null;
  viewedAt: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
