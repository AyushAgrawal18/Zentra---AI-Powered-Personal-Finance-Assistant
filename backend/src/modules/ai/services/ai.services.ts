import { NotFoundError } from "../../../common/errors";
import { logger } from "../../../common/logger";
import { INSIGHT_DB_TYPES, INSIGHT_MESSAGES } from "../constants";
import {
  InsightResponseDTO,
  ListInsightsQueryDTO,
  PaginationMeta,
} from "../dto";
import { aiRepository } from "../repositories";
import { mapInsightToDTO } from "../utils";

function expiry(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

export const refreshInsightsService = async (
  userId: string,
): Promise<{ status: "COMPLETED"; generated: number }> => {
  const context = await aiRepository.getContext(userId);
  const income = Number(context.summary.income);
  const expense = Number(context.summary.expense);
  const created = [];
  const create = async (
    title: string,
    message: string,
    type: string,
    priority: string,
  ) => {
    created.push(
      await aiRepository.create(userId, {
        title,
        message,
        type,
        priority,
        expiresAt: expiry(),
      }),
    );
  };

  await create(
    "Spending Summary",
    `You recorded ${Number(context.summary.count)} active transactions with income of ${income.toFixed(2)} and expenses of ${expense.toFixed(2)}.`,
    INSIGHT_DB_TYPES.SPENDING_SUMMARY,
    "low",
  );
  if (context.categories[0]) {
    const category = context.categories[0];
    await create(
      "Highest Spending Category",
      `${category.category} is currently your highest expense category at ${Number(category.amount).toFixed(2)}.`,
      INSIGHT_DB_TYPES.CATEGORY_TREND,
      "medium",
    );
  }
  if (income > 0 && expense > income) {
    await create(
      "Expenses Exceed Income",
      `Your recorded expenses exceed income by ${(expense - income).toFixed(2)} in the available transaction history.`,
      INSIGHT_DB_TYPES.BUDGET_ALERT,
      "high",
    );
  } else if (income > 0) {
    const savingsRate = ((income - expense) / income) * 100;
    await create(
      "Savings Recommendation",
      `Your current savings rate is ${savingsRate.toFixed(2)}%. Review your largest expense categories to improve it.`,
      INSIGHT_DB_TYPES.SAVINGS_RECOMMENDATION,
      savingsRate < 10 ? "high" : "medium",
    );
  }
  for (const budget of context.budgets) {
    const amount = Number(budget.amount);
    if (amount > 0) {
      const spent = Number(budget.spent_amount ?? 0);
      if (spent / amount >= 0.8)
        await create(
          "Budget Alert",
          `A budget is at ${((spent / amount) * 100).toFixed(2)}% utilization. Review spending before the limit is exceeded.`,
          INSIGHT_DB_TYPES.BUDGET_ALERT,
          spent >= amount ? "high" : "medium",
        );
    }
  }
  for (const goal of context.goals) {
    const target = Number(goal.target_amount);
    const current = Number(goal.current_amount);
    if (target > 0 && goal.status === "active" && current / target >= 0.8)
      await create(
        "Goal Progress",
        `A savings goal is ${((current / target) * 100).toFixed(2)}% complete.`,
        INSIGHT_DB_TYPES.GOAL_PROGRESS,
        "medium",
      );
  }
  logger.info({ userId, generated: created.length }, "AI insights refreshed");
  return { status: "COMPLETED", generated: created.length };
};

export const listInsightsService = async (
  userId: string,
  query: ListInsightsQueryDTO,
  history = false,
): Promise<{ data: InsightResponseDTO[]; meta: PaginationMeta }> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const dbType = query.category ? INSIGHT_DB_TYPES[query.category] : undefined;
  const result = await aiRepository.list({
    userId,
    page,
    limit,
    type: dbType,
    priority: query.priority,
    sort: query.sort,
    order: query.order,
    history,
  });
  return {
    data: result.rows.map(mapInsightToDTO),
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit) || 1,
    },
  };
};

export const getInsightService = async (
  id: string,
  userId: string,
): Promise<InsightResponseDTO> => {
  const record = await aiRepository.findById(id, userId);
  if (!record) throw new NotFoundError(INSIGHT_MESSAGES.NOT_FOUND);
  return mapInsightToDTO(record);
};

export const markInsightViewedService = async (
  id: string,
  userId: string,
): Promise<InsightResponseDTO> => {
  const record = await aiRepository.markViewed(id, userId);
  if (!record) throw new NotFoundError(INSIGHT_MESSAGES.NOT_FOUND);
  return mapInsightToDTO(record);
};
