import { NotFoundError } from "../../src/common/errors";
import { notificationRepository } from "../../src/modules/notifications/repositories";
import {
  createNotificationService,
  deleteNotificationService,
  getNotificationService,
  getNotificationPreferencesService,
  getUnreadCountService,
  listNotificationsService,
  markNotificationReadService,
  updateNotificationPreferencesService,
} from "../../src/modules/notifications/services";

jest.mock("../../src/modules/notifications/repositories");
const repo = notificationRepository;
const notification = {
  id: "88888888-8888-4888-8888-888888888888",
  user_id: "22222222-2222-4222-8222-222222222222",
  title: "Budget Alert",
  message: "Budget exceeded",
  notification_type: "budget",
  priority: "high",
  is_read: false,
  read_at: null,
  created_at: new Date("2026-09-10T10:00:00.000Z"),
};

beforeEach(() => {
  jest.clearAllMocks();
  (repo.create as jest.Mock).mockResolvedValue(notification);
  (repo.findById as jest.Mock).mockResolvedValue(notification);
  (repo.list as jest.Mock).mockResolvedValue({
    rows: [notification],
    total: 1,
  });
  (repo.unreadCount as jest.Mock).mockResolvedValue(3);
  (repo.markRead as jest.Mock).mockResolvedValue(true);
  (repo.markAllRead as jest.Mock).mockResolvedValue(1);
  (repo.delete as jest.Mock).mockResolvedValue(true);
  (repo.getPreferences as jest.Mock).mockResolvedValue(true);
  (repo.updatePreferences as jest.Mock).mockResolvedValue(false);
});

describe("Notification services", () => {
  it("creates and maps a notification from an event", async () => {
    const result = await createNotificationService({
      userId: "user-1",
      title: "Budget Alert",
      message: "Budget exceeded",
      type: "BUDGET",
      priority: "HIGH",
    });
    expect(result?.type).toBe("BUDGET");
    expect(result?.priority).toBe("HIGH");
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: "budget", priority: "high" }),
    );
  });

  it("suppresses creation when preferences disable notifications", async () => {
    (repo.create as jest.Mock).mockResolvedValue(null);
    await expect(
      createNotificationService({
        userId: "user-1",
        title: "x",
        message: "y",
        type: "SYSTEM",
      }),
    ).resolves.toBeNull();
  });

  it("lists notifications with pagination metadata", async () => {
    const result = await listNotificationsService("user-1", {
      page: 2,
      limit: 10,
      status: "UNREAD",
    } as any);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        page: 2,
        limit: 10,
        status: "UNREAD",
      }),
    );
  });

  it("protects notification ownership", async () => {
    (repo.findById as jest.Mock).mockResolvedValue(null);
    await expect(
      getNotificationService(notification.id, "other-user"),
    ).rejects.toThrow(NotFoundError);
  });

  it("marks one notification read and reports unread count", async () => {
    await expect(
      markNotificationReadService(notification.id, "user-1"),
    ).resolves.toBeUndefined();
    expect(repo.markRead).toHaveBeenCalledWith(notification.id, "user-1");
    await expect(getUnreadCountService("user-1")).resolves.toEqual({
      count: 3,
    });
  });

  it("deletes owned notifications and updates the persisted preference", async () => {
    await expect(
      deleteNotificationService(notification.id, "user-1"),
    ).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(notification.id, "user-1");
    await expect(getNotificationPreferencesService("user-1")).resolves.toEqual({
      notificationsEnabled: true,
    });
    await expect(
      updateNotificationPreferencesService("user-1", {
        notificationsEnabled: false,
      }),
    ).resolves.toEqual({ notificationsEnabled: false });
  });
});
