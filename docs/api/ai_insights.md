---
title: AI Insights API

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: AI Team

related_docs:
  - api_overview.md
  - ai_chat.md
  - analytics.md
  - authentication.md
  - errors.md
  - ../ai/ai_architecture.md
---

# AI Insights API

> This document defines every endpoint related to AI-generated financial insights, recommendations, summaries, alerts, and spending analysis in Zentra.

---

# Table of Contents

1. Purpose
2. Authentication
3. AI Insight Categories
4. Insight Generation Flow
5. Endpoints
6. Insight Model
7. Get Insights
8. Get Insight
9. Refresh Insights
10. Insight History
11. Query Parameters
12. Validation Rules
13. Response Examples
14. Error Responses
15. Business Rules
16. Security & Privacy
17. Design Principles

---

# 1. Purpose

The AI Insights API provides proactive financial analysis based on the user's financial data.

Version 1 supports:

- Spending summaries
- Budget analysis
- Savings recommendations
- Expense alerts
- Category trends
- Monthly financial summaries
- Personalized recommendations

Insights are informational only.

The AI never performs financial operations automatically.

The current implementation uses deterministic backend analysis because no AI
provider or model adapter is configured in the repository. Insight messages are
derived only from verified, user-owned financial aggregates.

---

# 2. Authentication

All AI Insight endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users may access only their own insights.

---

# 3. AI Insight Categories

Supported insight types:

- SPENDING_SUMMARY
- BUDGET_ALERT
- SAVINGS_RECOMMENDATION
- CATEGORY_TREND
- GOAL_PROGRESS
- CASH_FLOW
- MONTHLY_REPORT

Possible priorities:

- LOW
- MEDIUM
- HIGH

---

# 4. Insight Generation Flow

```
Financial Data

↓

Analytics Engine

↓

AI Context Builder

↓

LLM Processing

↓

Insight Validation

↓

Store Insight

↓

Return to User
```

Insights may also be regenerated after significant financial changes.

---

# 5. Endpoints

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | /ai/insights         | List insights       |
| GET    | /ai/insights/{id}    | Get insight         |
| POST   | /ai/insights/refresh | Regenerate insights |
| GET    | /ai/insights/history | Insight history     |

---

# 6. Insight Model

An insight contains:

- Insight ID
- Title
- Summary
- Category
- Priority
- Generated At
- Expiration Time
- Related Resources

Insights may reference:

- Transactions
- Budgets
- Goals
- Categories

---

# 7. Get Insights

## Endpoint

```http
GET /api/v1/ai/insights
```

Returns the latest active AI-generated insights.

Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Food Spending Increased",
      "summary": "Your food expenses increased by 18% compared to last month.",
      "category": "CATEGORY_TREND",
      "priority": "MEDIUM",
      "generatedAt": "2026-08-01T10:30:00Z"
    }
  ]
}
```

---

# 8. Get Insight

## Endpoint

```http
GET /api/v1/ai/insights/{id}
```

Returns the complete insight including supporting information and referenced financial data.

---

# 9. Refresh Insights

## Endpoint

```http
POST /api/v1/ai/insights/refresh
```

Triggers regeneration of AI insights using the user's latest financial data.

Example Response

```json
{
  "success": true,
  "message": "Insight generation started.",
  "data": {
    "status": "PROCESSING"
  }
}
```

Insight generation may execute asynchronously.

---

# 10. Insight History

## Endpoint

```http
GET /api/v1/ai/insights/history
```

Returns previously generated insights.

Supports:

- Pagination
- Filtering
- Sorting

---

# 11. Query Parameters

| Parameter | Description         |
| --------- | ------------------- |
| category  | Insight category    |
| priority  | LOW / MEDIUM / HIGH |
| page      | Page number         |
| limit     | Page size           |
| sort      | Sort field          |
| order     | asc / desc          |

---

# 12. Validation Rules

Validation includes:

- Supported categories only.
- Valid pagination parameters.
- Insight must belong to the authenticated user.
- Refresh requests are subject to rate limits.

Validation failures return HTTP 422.

---

# 13. Response Examples

Insight Detail

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Budget Alert",
    "summary": "You have spent 90% of your monthly food budget.",
    "category": "BUDGET_ALERT",
    "priority": "HIGH",
    "recommendations": [
      "Reduce restaurant spending.",
      "Cook more meals at home."
    ]
  }
}
```

Insight History

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 34
  }
}
```

---

# 14. Error Responses

| HTTP | Error Code          |
| ---- | ------------------- |
| 400  | BAD_REQUEST         |
| 401  | UNAUTHORIZED        |
| 403  | FORBIDDEN           |
| 404  | INSIGHT_NOT_FOUND   |
| 429  | RATE_LIMIT_EXCEEDED |
| 422  | VALIDATION_ERROR    |
| 500  | AI_SERVICE_ERROR    |

Responses follow `errors.md`.

---

# 15. Business Rules

- Insights are generated from the user's financial data only.
- Insights never modify financial records.
- Users may refresh insights manually.
- Significant financial changes may trigger automatic regeneration.
- AI recommendations are advisory and require user action.
- Historical insights remain available until retention policies expire.

---

# 16. Security & Privacy

- JWT authentication required.
- Insights are private to each user.
- Only minimum required financial context is shared with AI providers.
- Sensitive credentials are never transmitted.
- AI processing follows Zentra's privacy policy.

---

# 17. Design Principles

- Personalized recommendations
- Read-only financial analysis
- Explainable AI outputs
- Secure context handling
- Provider abstraction
- Strong validation
- Consistent response format

---

# References

- api_overview.md
- ai_chat.md
- analytics.md
- authentication.md
- errors.md
- ../ai/ai_architecture.md

---

> **API Principle:** The AI Insights API transforms financial data into actionable recommendations while preserving user privacy and financial integrity. Every insight should be explainable, personalized, non-destructive, and generated using the latest available financial context.
