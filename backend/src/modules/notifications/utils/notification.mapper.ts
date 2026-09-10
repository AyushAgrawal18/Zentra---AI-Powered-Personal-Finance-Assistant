import { NotificationRecord, NotificationResponseDTO } from "../dto";

export function mapNotificationToDTO(
  record: NotificationRecord,
): NotificationResponseDTO {
  return {
    id: record.id,
    userId: record.user_id,
    title: record.title,
    message: record.message,
    type: record.notification_type.toUpperCase(),
    priority: record.priority ? record.priority.toUpperCase() : null,
    read: Boolean(record.is_read || record.read_at),
    createdAt: new Date(record.created_at).toISOString(),
    readAt: record.read_at ? new Date(record.read_at).toISOString() : null,
  };
}
