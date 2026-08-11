import { z } from 'zod';
import {
  createGoalSchema,
  updateGoalSchema,
  listGoalsSchema,
  contributeGoalSchema,
} from '../validators';

// ── Inferred request DTOs ─────────────────────────────────────────────────────
export type CreateGoalDTO = z.infer<typeof createGoalSchema>['body'];
export type UpdateGoalDTO = z.infer<typeof updateGoalSchema>['body'];
export type ListGoalsQueryDTO = z.infer<typeof listGoalsSchema>['query'];
export type ContributeGoalDTO = z.infer<typeof contributeGoalSchema>['body'];

// ── Response shape returned from every goal endpoint ─────────────────────────
export interface GoalResponseDTO {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  completionPercentage: number;
  targetDate: string;
  notes: string | null;
  description: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// ── Progress shape ────────────────────────────────────────────────────────────
export interface GoalProgressDTO {
  goalId: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  completionPercentage: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

// ── Contribute response ───────────────────────────────────────────────────────
export interface ContributeResponseDTO {
  currentAmount: number;
  completionPercentage: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

// ── Pagination meta (same shape used in other modules) ────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
