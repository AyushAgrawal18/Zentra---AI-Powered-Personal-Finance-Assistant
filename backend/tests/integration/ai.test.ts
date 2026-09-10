import express from "express";
import request from "supertest";
import { errorHandler } from "../../src/common/middleware/errorHandler";
import { aiRoutes } from "../../src/modules/ai/routes";
import { aiRepository } from "../../src/modules/ai/repositories";

jest.mock("../../src/modules/ai/repositories");
jest.mock("../../src/modules/auth/utils", () => ({
  ...jest.requireActual("../../src/modules/auth/utils"),
  verifyAccessToken: jest
    .fn()
    .mockReturnValue({ userId: "22222222-2222-4222-8222-222222222222" }),
}));
const app = express();
app.use(express.json());
app.use("/api/v1/ai", aiRoutes);
app.use(errorHandler);
const auth = { Authorization: "Bearer valid-token" };
const insight = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  user_id: "22222222-2222-4222-8222-222222222222",
  title: "Budget Alert",
  message: "Budget is near its limit",
  insight_type: "budget_warning",
  priority: "high",
  generated_at: new Date("2026-09-10T10:00:00.000Z"),
  expires_at: new Date("2026-10-10T10:00:00.000Z"),
  viewed_at: null,
};
const repo = aiRepository;

beforeEach(() => {
  jest.clearAllMocks();
  (repo.getContext as jest.Mock).mockResolvedValue({
    summary: { count: "1", income: "1000", expense: "500" },
    categories: [],
    budgets: [],
    goals: [],
  });
  (repo.create as jest.Mock).mockResolvedValue(insight);
  (repo.list as jest.Mock).mockResolvedValue({ rows: [insight], total: 1 });
  (repo.findById as jest.Mock).mockResolvedValue(insight);
  (repo.markViewed as jest.Mock).mockResolvedValue({
    ...insight,
    viewed_at: new Date(),
  });
});

describe("AI Insights authentication", () => {
  it("requires authentication", async () => {
    expect((await request(app).get("/api/v1/ai/insights")).status).toBe(401);
  });
});

describe("AI Insights API", () => {
  it("refreshes and lists insights", async () => {
    const refreshed = await request(app)
      .post("/api/v1/ai/insights/refresh")
      .set(auth);
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.status).toBe("COMPLETED");
    const listed = await request(app)
      .get(
        "/api/v1/ai/insights?category=BUDGET_ALERT&priority=HIGH&page=2&limit=10",
      )
      .set(auth);
    expect(listed.status).toBe(200);
    expect(listed.body.data[0].category).toBe("BUDGET_ALERT");
    expect(listed.body.meta.total).toBe(1);
  });

  it("gets an owned insight", async () => {
    const details = await request(app)
      .get(`/api/v1/ai/insights/${insight.id}`)
      .set(auth);
    expect(details.status).toBe(200);
  });

  it("protects ownership and validates IDs", async () => {
    (repo.findById as jest.Mock).mockResolvedValue(null);
    expect(
      (await request(app).get(`/api/v1/ai/insights/${insight.id}`).set(auth))
        .status,
    ).toBe(404);
    expect(
      (await request(app).get("/api/v1/ai/insights/not-a-uuid").set(auth))
        .status,
    ).toBe(400);
  });

  it("returns insight history", async () => {
    const response = await request(app)
      .get("/api/v1/ai/insights/history?page=1&limit=20")
      .set(auth);
    expect(response.status).toBe(200);
    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({ history: true }),
    );
  });
});
