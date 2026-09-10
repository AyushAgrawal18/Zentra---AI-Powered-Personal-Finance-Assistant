import { ReportRecord, ReportResponseDTO } from "../dto";

export function mapReportToDTO(record: ReportRecord): ReportResponseDTO {
  const parameters = record.parameters ?? {};
  return {
    id: record.id,
    reportType: record.report_type,
    format: String(parameters.format ?? "CSV"),
    status: "COMPLETED",
    downloadUrl: `/api/v1/reports/${record.id}/download`,
    parameters,
    createdAt: new Date(record.created_at).toISOString(),
  };
}
