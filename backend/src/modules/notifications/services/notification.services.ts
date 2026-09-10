import { ConflictError, NotFoundError } from "../../../common/errors";
import { logger } from "../../../common/logger";
import { NOTIFICATION_MESSAGES } from "../constants";
import {
  ListNotificationsQueryDTO,
  NotificationPreferencesDTO,
  NotificationResponseDTO,
  PaginationMeta,
} from "../dto";
import { notificationRepository } from "../repositories";
import { mapNotificationToDTO } from "../utils";

export const createNotificationService = async (params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
}): Promise<NotificationResponseDTO | null> => {
  const record = await notificationRepository.create({
    ...params,
    type: params.type.toLowerCase(),
    priority: params.priority?.toLowerCase(),
  });
  if (!record) return null;
  logger.info(
    { notificationId: record.id, userId: params.userId, type: params.type },
    "Notification created",
  );
  return mapNotificationToDTO(record);
};

export const listNotificationsService = async (
  userId: string,
  query: ListNotificationsQueryDTO,
): Promise<{ data: NotificationResponseDTO[]; meta: PaginationMeta }> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const result = await notificationRepository.list({
    userId,
    page,
    limit,
    type: query.type,
    priority: query.priority,
    status: query.status,
    sort: query.sort,
    order: query.order,
  });
  return {
    data: result.rows.map(mapNotificationToDTO),
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit) || 1,
    },
  };
};

export const getNotificationService = async (
  id: string,
  userId: string,
): Promise<NotificationResponseDTO> => {
  const record = await notificationRepository.findById(id, userId);
  if (!record) throw new NotFoundError(NOTIFICATION_MESSAGES.NOT_FOUND);
  return mapNotificationToDTO(record);
};

export const markNotificationReadService = async (
  id: string,
  userId: string,
): Promise<void> => {
  const existing = await notificationRepository.findById(id, userId);
  if (!existing) throw new NotFoundError(NOTIFICATION_MESSAGES.NOT_FOUND);
  await notificationRepository.markRead(id, userId);
};

export const markAllNotificationsReadService = async (
  userId: string,
): Promise<void> => {
  await notificationRepository.markAllRead(userId);
};

export const getUnreadCountService = async (
  userId: string,
): Promise<{ count: number }> => ({
  count: await notificationRepository.unreadCount(userId),
});

export const deleteNotificationService = async (
  id: string,
  userId: string,
): Promise<void> => {
  const deleted = await notificationRepository.delete(id, userId);
  if (!deleted) throw new NotFoundError(NOTIFICATION_MESSAGES.NOT_FOUND);
};

export const getNotificationPreferencesService = async (
  userId: string,
): Promise<{ notificationsEnabled: boolean }> => ({
  notificationsEnabled: await notificationRepository.getPreferences(userId),
});

export const updateNotificationPreferencesService = async (
  userId: string,
  dto: NotificationPreferencesDTO,
): Promise<{ notificationsEnabled: boolean }> => ({
  notificationsEnabled: await notificationRepository.updatePreferences(
    userId,
    dto.notificationsEnabled,
  ),
});
