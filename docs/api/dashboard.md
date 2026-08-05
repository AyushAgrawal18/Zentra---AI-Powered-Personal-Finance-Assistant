# 🌐 API Specification: Dashboard
---
title: Dashboard API

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - api_overview.md
  - authentication.md
  - pagination.md
  - ../development/features/dashboard.md
  - ../architecture/sequence-diagrams/transaction_flow.md
---

# Dashboard API

> This document defines the Dashboard API, which provides users with a consolidated financial overview by aggregating data from multiple modules.

---

# Table of Contents

1. Purpose
2. Authentication
3. Endpoints
4. Get Dashboard Summary
5. Dashboard Response
6. Dashboard Sections
7. Query Parameters
8. Caching
9. Error Responses
10. Design Principles

---

# 1. Purpose

The Dashboard API provides a single endpoint that returns the user's financial summary.

It aggregates data from:

- Transactions
- Budgets
- Goals
- Analytics
- AI Insights
- Notifications

The Dashboard is read-only.

---

# 2. Authentication

Authentication Required

```
Bearer JWT
```

All dashboard endpoints require a valid access token.

---

# 3. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /dashboard | Dashboard summary |
| GET | /dashboard/refresh | Refresh dashboard cache |

---

# 4. Get Dashboard Summary

## Endpoint

```http
GET /api/v1/dashboard
```

Optional query parameters

```http
GET /api/v1/dashboard?month=8&year=2026
```

---

# 5. Dashboard Response

```json
{
  "success": true,
  "data": {
    "summary": {
      "balance": 52450,
      "income": 75000,
      "expense": 22550,
      "savings": 52450
    },

    "budgets": [],

    "goals": [],

    "recentTransactions": [],

    "analytics": {},

    "aiInsights": [],

    "notifications": []
  },

  "timestamp": "2026-08-01T10:30:00Z"
}
```

---

# 6. Dashboard Sections

## Financial Summary

Contains:

- Current Balance
- Total Income
- Total Expense
- Savings

---

## Budget Overview

Contains:

- Budget Amount
- Spent Amount
- Remaining Amount
- Usage Percentage

---

## Goals

Contains:

- Goal Name
- Target Amount
- Current Progress
- Completion Percentage

---

## Recent Transactions

Returns the latest transactions.

Default

```
10 Records
```

---

## Analytics

Contains:

- Monthly Spending
- Income vs Expense
- Top Categories
- Cash Flow

---

## AI Insights

Contains:

- Spending Alerts
- Budget Suggestions
- Savings Recommendations
- Monthly Insights

---

## Notifications

Contains unread notifications.

Default

```
5 Records
```

---

# 7. Query Parameters

| Parameter | Description |
|------------|-------------|
| month | Dashboard month |
| year | Dashboard year |

Example

```http
GET /dashboard?month=8&year=2026
```

If omitted, the current month is used.

---

# 8. Caching

Dashboard responses may be cached.

Cache should be invalidated after:

- Transaction Created
- Transaction Updated
- Transaction Deleted
- Budget Updated
- Goal Updated
- Payment Reconciled

---

# 9. Error Responses

Possible errors

| HTTP | Error |
|------|-------|
|401|Unauthorized|
|404|Dashboard Not Found|
|422|Invalid Query|
|500|Internal Server Error|

All error responses follow `errors.md`.

---

# 10. Design Principles

- Read-only endpoint
- Aggregated response
- Cached where appropriate
- Consistent response format
- Authentication required
- No business logic in controllers
- Dashboard should not directly query unrelated modules

---

# References

- api_overview.md
- authentication.md
- errors.md
- ../development/features/dashboard.md
- ../architecture/sequence-diagrams/transaction_flow.md

---

> **API Principle:** The Dashboard API is an aggregation endpoint that provides a unified financial overview. It combines information from multiple modules through backend services while remaining read-only, performant, and consistent with Zentra's API standards.