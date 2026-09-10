import { InsightRecord, InsightResponseDTO } from "../dto";

const displayType: Record<string, string> = {
  spending_analysis: "SPENDING_SUMMARY",
  budget_warning: "BUDGET_ALERT",
  goal_prediction: "GOAL_PROGRESS",
  general: "MONTHLY_REPORT",
};

export function mapInsightToDTO(record: InsightRecord): InsightResponseDTO {
  return {
    id: record.id,
    title: record.title,
    summary: record.message,
    category: displayType[record.insight_type] ?? "MONTHLY_REPORT",
    priority: record.priority.toUpperCase(),
    generatedAt: new Date(record.generated_at).toISOString(),
    expiresAt: record.expires_at
      ? new Date(record.expires_at).toISOString()
      : null,
    viewedAt: record.viewed_at
      ? new Date(record.viewed_at).toISOString()
      : null,
  };
}
