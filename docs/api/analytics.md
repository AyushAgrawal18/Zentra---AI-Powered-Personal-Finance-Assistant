# 🌐 API Specification: Financial Analytics
---
title: Analytics API

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - api_overview.md
  - authentication.md
  - pagination.md
  - errors.md
  - dashboard.md
  - ../development/features/analytics.md
---

# Analytics API

> This document defines every endpoint related to financial analytics, reports, trends, and chart data in Zentra.

---

# Table of Contents

1. Purpose
2. Authentication
3. Endpoints
4. Analytics Overview
5. Spending Trends
6. Income vs Expense
7. Category Breakdown
8. Cash Flow
9. Monthly Summary
10. Yearly Summary
11. Query Parameters
12. Response Examples
13. Validation Rules
14. Error Responses
15. Business Rules
16. Design Principles

---

# 1. Purpose

The Analytics API provides summarized financial information for visualization and reporting.

It powers:

- Dashboard charts
- Reports
- AI Insights
- Financial summaries
- Trend analysis

Analytics endpoints are read-only.

---

# 2. Authentication

All endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Analytics data is private to the authenticated user.

---

# 3. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /analytics/summary | Financial summary |
| GET | /analytics/spending | Spending trends |
| GET | /analytics/income-expense | Income vs Expense |
| GET | /analytics/categories | Category breakdown |
| GET | /analytics/cash-flow | Cash flow |
| GET | /analytics/monthly | Monthly report |
| GET | /analytics/yearly | Yearly report |

---

# 4. Analytics Overview

## Endpoint

```http
GET /api/v1/analytics/summary
```

Returns:

- Total Income
- Total Expenses
- Net Savings
- Transaction Count
- Average Spending

---

# 5. Spending Trends

## Endpoint

```http
GET /api/v1/analytics/spending
```

Example

```http
GET /analytics/spending?period=monthly
```

Returns chart-ready spending data grouped by:

- Day
- Week
- Month
- Year

---

# 6. Income vs Expense

## Endpoint

```http
GET /api/v1/analytics/income-expense
```

Example Response

```json
{
  "success": true,
  "data": {
    "income": 75000,
    "expense": 22550,
    "savings": 52450
  }
}
```

---

# 7. Category Breakdown

## Endpoint

```http
GET /api/v1/analytics/categories
```

Example Response

```json
{
  "success": true,
  "data": [
    {
      "category": "Food",
      "amount": 4500,
      "percentage": 22.5
    },
    {
      "category": "Travel",
      "amount": 2500,
      "percentage": 12.5
    }
  ]
}
```

---

# 8. Cash Flow

## Endpoint

```http
GET /api/v1/analytics/cash-flow
```

Returns:

- Opening Balance
- Total Income
- Total Expense
- Closing Balance

Grouped by the requested period.

---

# 9. Monthly Summary

## Endpoint

```http
GET /api/v1/analytics/monthly
```

Example

```http
GET /analytics/monthly?month=8&year=2026
```

Returns:

- Income
- Expenses
- Savings
- Budget Usage
- Goal Contributions
- Top Spending Categories

---

# 10. Yearly Summary

## Endpoint

```http
GET /api/v1/analytics/yearly
```

Example

```http
GET /analytics/yearly?year=2026
```

Returns month-wise financial summaries suitable for annual reports and charts.

---

# 11. Query Parameters

| Parameter | Description |
|-----------|-------------|
| period | daily, weekly, monthly, yearly |
| month | Month number |
| year | Year |
| category | Category ID |
| from | Start date |
| to | End date |

Invalid query parameters return HTTP 422.

---

# 12. Response Examples

Example Summary

```json
{
  "success": true,
  "data": {
    "totalIncome": 75000,
    "totalExpense": 22550,
    "netSavings": 52450,
    "transactionCount": 84
  }
}
```

Example Trend

```json
{
  "success": true,
  "data": [
    {
      "label": "Jan",
      "income": 70000,
      "expense": 22000
    },
    {
      "label": "Feb",
      "income": 76000,
      "expense": 24500
    }
  ]
}
```

Responses are optimized for direct use in frontend chart libraries.

---

# 13. Validation Rules

Validation includes:

- Supported reporting periods only.
- Valid date ranges.
- Existing category IDs.
- `from` date must not be after `to`.
- Requested period must not exceed configured limits.

Validation failures return HTTP 422.

---

# 14. Error Responses

| HTTP | Error Code |
|------|------------|
| 400 | BAD_REQUEST |
| 401 | UNAUTHORIZED |
| 404 | ANALYTICS_NOT_FOUND |
| 422 | VALIDATION_ERROR |
| 500 | INTERNAL_SERVER_ERROR |

Responses follow `errors.md`.

---

# 15. Business Rules

- Analytics are generated only from active transactions.
- Soft-deleted transactions are excluded.
- Calculations are performed in the service layer.
- Dashboard and Analytics share the same calculation logic.
- Analytics never modify stored financial data.
- Cached analytics should be refreshed after relevant financial changes.

---

# 16. Design Principles

- Read-only endpoints
- Chart-ready responses
- Aggregated financial data
- Consistent response format
- High-performance queries
- Shared calculation logic
- Strong validation

---

# References

- api_overview.md
- dashboard.md
- authentication.md
- pagination.md
- errors.md
- ../development/features/analytics.md

---

> **API Principle:** The Analytics API transforms financial records into meaningful insights without modifying underlying data. Every endpoint should return accurate, chart-ready information that is consistent across the Dashboard, Reports, and AI modules.