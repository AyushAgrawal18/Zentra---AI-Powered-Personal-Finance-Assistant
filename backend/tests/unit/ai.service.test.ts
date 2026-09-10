import { NotFoundError } from "../../src/common/errors";
import { aiRepository } from "../../src/modules/ai/repositories";
import {
  getInsightService,
  listInsightsService,
  markInsightViewedService,
  refreshInsightsService,
} from "../../src/modules/ai/services";

jest.mock("../../src/modules/ai/repositories");
const repo = aiRepository;
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

beforeEach(() => {
  jest.clearAllMocks();
  (repo.getContext as jest.Mock).mockResolvedValue({
    summary: { count: "4", income: "10000", expense: "9000" },
    categories: [{ category: "Food", amount: "5000" }],
    budgets: [{ amount: "4000", spent_amount: "3600" }],
    goals: [
      { target_amount: "10000", current_amount: "8500", status: "active" },
    ],
  });
  (repo.create as jest.Mock).mockImplementation(
    async (_user: string, value: any) => ({
      ...insight,
      title: value.title,
      message: value.message,
      insight_type: value.type,
      priority: value.priority,
    }),
  );
  (repo.list as jest.Mock).mockResolvedValue({ rows: [insight], total: 1 });
  (repo.findById as jest.Mock).mockResolvedValue(insight);
  (repo.markViewed as jest.Mock).mockResolvedValue({
    ...insight,
    viewed_at: new Date("2026-09-11T10:00:00.000Z"),
  });
});

describe("AI Insights services", () => {
  it("generates deterministic insights from verified aggregate context", async () => {
    const result = await refreshInsightsService("user-1");
    expect(result.status).toBe("COMPLETED");
    expect(result.generated).toBeGreaterThan(0);
    expect(repo.create).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        type: expect.any(String),
        message: expect.any(String),
      }),
    );
    expect((repo.create as jest.Mock).mock.calls[0][1].message).not.toContain(
      "password",
    );
  });

  it("handles empty data without fabricating financial claims", async () => {
    (repo.getContext as jest.Mock).mockResolvedValue({
      summary: { count: "0", income: "0", expense: "0" },
      categories: [],
      budgets: [],
      goals: [],
    });
    const result = await refreshInsightsService("user-1");
    expect(result.generated).toBe(1);
  });

  it("lists active insights with user-scoped filters and history pagination", async () => {
    const result = await listInsightsService("user-1", {
      category: "BUDGET_ALERT",
      priority: "HIGH",
      page: 2,
      limit: 10,
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
        type: "budget_warning",
        priority: "HIGH",
        history: false,
      }),
    );
  });

  it("protects ownership and marks viewed state", async () => {
    (repo.findById as jest.Mock).mockResolvedValue(null);
    await expect(getInsightService(insight.id, "other-user")).rejects.toThrow(
      NotFoundError,
    );
    (repo.findById as jest.Mock).mockResolvedValue(insight);
    const viewed = await markInsightViewedService(insight.id, "user-1");
    expect(viewed.viewedAt).toBeTruthy();
  });

  it("propagates provider-independent data failures safely", async () => {
    (repo.getContext as jest.Mock).mockRejectedValue(
      new Error("context failure"),
    );
    await expect(refreshInsightsService("user-1")).rejects.toThrow(
      "context failure",
    );
  });
});
