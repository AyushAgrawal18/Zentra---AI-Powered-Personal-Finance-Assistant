import express from "express";
import request from "supertest";
import { errorHandler } from "../../src/common/middleware/errorHandler";
import { notificationRoutes } from "../../src/modules/notifications/routes";
import { notificationRepository } from "../../src/modules/notifications/repositories";

jest.mock("../../src/modules/notifications/repositories");
jest.mock("../../src/modules/auth/utils", () => ({
  ...jest.requireActual("../../src/modules/auth/utils"),
  verifyAccessToken: jest
    .fn()
    .mockReturnValue({ userId: "22222222-2222-4222-8222-222222222222" }),
}));
const app = express();
app.use(express.json());
app.use("/api/v1/notifications", notificationRoutes);
app.use(errorHandler);
const auth = { Authorization: "Bearer valid-token" };
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
const repo = notificationRepository;

beforeEach(() => {
  jest.clearAllMocks();
  (repo.findById as jest.Mock).mockResolvedValue(notification);
  (repo.list as jest.Mock).mockResolvedValue({
    rows: [notification],
    total: 1,
  });
  (repo.unreadCount as jest.Mock).mockResolvedValue(2);
  (repo.markRead as jest.Mock).mockResolvedValue(true);
  (repo.markAllRead as jest.Mock).mockResolvedValue(1);
  (repo.delete as jest.Mock).mockResolvedValue(true);
  (repo.getPreferences as jest.Mock).mockResolvedValue(true);
  (repo.updatePreferences as jest.Mock).mockResolvedValue(false);
});

describe("Notifications authentication", () => {
  it("requires authentication", async () => {
    expect((await request(app).get("/api/v1/notifications")).status).toBe(401);
  });
});

describe("Notifications API", () => {
  it("lists filtered notifications", async () => {
    const response = await request(app)
      .get("/api/v1/notifications?type=budget&status=UNREAD&page=2&limit=10")
      .set(auth);
    expect(response.status).toBe(200);
    expect(response.body.data[0].type).toBe("BUDGET");
    expect(response.body.meta).toEqual({
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "budget",
        status: "UNREAD",
        page: 2,
        limit: 10,
      }),
    );
  });

  it("gets a notification and protects ownership", async () => {
    const response = await request(app)
      .get(`/api/v1/notifications/${notification.id}`)
      .set(auth);
    expect(response.status).toBe(200);
    (repo.findById as jest.Mock).mockResolvedValue(null);
    const missing = await request(app)
      .get(`/api/v1/notifications/${notification.id}`)
      .set(auth);
    expect(missing.status).toBe(404);
  });

  it("marks one and all notifications as read", async () => {
    expect(
      (
        await request(app)
          .patch(`/api/v1/notifications/${notification.id}/read`)
          .set(auth)
      ).status,
    ).toBe(200);
    expect(
      (await request(app).patch("/api/v1/notifications/read-all").set(auth))
        .status,
    ).toBe(200);
    expect(repo.markAllRead).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
    );
  });

  it("returns unread count and manages the supported preference", async () => {
    const count = await request(app)
      .get("/api/v1/notifications/unread-count")
      .set(auth);
    expect(count.body.data).toEqual({ count: 2 });
    const preferences = await request(app)
      .patch("/api/v1/notifications/preferences")
      .set(auth)
      .send({ notificationsEnabled: false });
    expect(preferences.status).toBe(200);
    expect(preferences.body.data).toEqual({ notificationsEnabled: false });
  });

  it("deletes an owned notification and rejects invalid IDs", async () => {
    expect(
      (
        await request(app)
          .delete(`/api/v1/notifications/${notification.id}`)
          .set(auth)
      ).status,
    ).toBe(200);
    expect(
      (await request(app).get("/api/v1/notifications/not-a-uuid").set(auth))
        .status,
    ).toBe(400);
  });
});
