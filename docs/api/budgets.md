---
title: Budgets API

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
  - ../development/features/budgets.md
  - ../development/features/categories.md
  - ../development/features/transactions.md
---

# Budgets API

> This document defines every endpoint related to budget management in Zentra, including budget creation, updates, progress tracking, category budgets, alerts, and budget summaries.

---

# Table of Contents

1. Purpose
2. Authentication
3. Endpoints
4. Budget Model
5. Create Budget
6. Get Budgets
7. Get Budget
8. Update Budget
9. Delete Budget
10. Budget Progress
11. Query Parameters
12. Validation Rules
13. Response Examples
14. Error Responses
15. Business Rules
16. Design Principles

---

# 1. Purpose

The Budgets API allows users to define spending limits and monitor their spending progress.

Budgets support:

- Monthly budgets
- Category budgets
- Budget progress
- Budget alerts
- Spending summaries

---

# 2. Authentication

All endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Budgets are private to the authenticated user.

---

# 3. Endpoints

| Method | Endpoint               | Description     |
| ------ | ---------------------- | --------------- |
| GET    | /budgets               | List budgets    |
| POST   | /budgets               | Create budget   |
| GET    | /budgets/{id}          | Get budget      |
| PATCH  | /budgets/{id}          | Update budget   |
| DELETE | /budgets/{id}          | Delete budget   |
| GET    | /budgets/{id}/progress | Budget progress |
| GET    | /budgets/summary       | Budget summary  |

---

# 4. Budget Model

A budget contains:

- Name
- Category
- Amount
- Period
- Start Date
- End Date
- Alert Threshold
- Status

Supported database periods

- Monthly
- Weekly
- Yearly

Version 1 product scope currently exposes monthly budgets. Quarterly budgets are
not supported by the database enum and must not be sent to the API.

---

# 5. Create Budget

## Endpoint

```http
POST /api/v1/budgets
```

### Request

```json
{
  "name": "Monthly Food Budget",
  "categoryId": "uuid",
  "amount": 10000,
  "period": "MONTHLY",
  "alertThreshold": 80
}
```

### Success

```http
201 Created
```

```json
{
  "success": true,
  "message": "Budget created successfully.",
  "data": {
    "id": "uuid"
  }
}
```

---

# 6. Get Budgets

## Endpoint

```http
GET /api/v1/budgets
```

Supports:

- Pagination
- Filtering
- Sorting
- Search

Example

```http
GET /budgets?period=MONTHLY
```

---

# 7. Get Budget

## Endpoint

```http
GET /api/v1/budgets/{id}
```

Returns complete budget details including current progress.

---

# 8. Update Budget

## Endpoint

```http
PATCH /api/v1/budgets/{id}
```

Example

```json
{
  "amount": 12000,
  "alertThreshold": 90
}
```

Only supplied fields are updated.

---

# 9. Delete Budget

## Endpoint

```http
DELETE /api/v1/budgets/{id}
```

Budgets are soft deleted.

Response

```json
{
  "success": true,
  "message": "Budget deleted successfully."
}
```

---

# 10. Budget Progress

## Endpoint

```http
GET /api/v1/budgets/{id}/progress
```

Example Response

```json
{
  "success": true,
  "data": {
    "budgetAmount": 10000,
    "spentAmount": 7200,
    "remainingAmount": 2800,
    "usagePercentage": 72,
    "status": "ON_TRACK"
  }
}
```

Possible status values

- ON_TRACK
- NEAR_LIMIT
- EXCEEDED

---

# 11. Query Parameters

| Parameter | Description             |
| --------- | ----------------------- |
| period    | Monthly, Weekly, Yearly |
| category  | Category ID             |
| status    | Budget status           |
| page      | Page number             |
| limit     | Page size               |
| sort      | Sort field              |
| order     | asc / desc              |

---

# 12. Validation Rules

Validation includes:

- Budget amount must be greater than zero.
- Category must exist.
- Alert threshold must be between 1 and 100.
- End date must not be earlier than start date.
- Period must be supported.

Validation failures return HTTP 422.

---

# 13. Response Examples

Single budget

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Monthly Food Budget",
    "amount": 10000,
    "spentAmount": 7200,
    "remainingAmount": 2800,
    "usagePercentage": 72,
    "status": "ON_TRACK"
  }
}
```

Collection

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8
  }
}
```

---

# 14. Error Responses

| HTTP | Error Code            |
| ---- | --------------------- |
| 400  | BAD_REQUEST           |
| 401  | UNAUTHORIZED          |
| 403  | FORBIDDEN             |
| 404  | BUDGET_NOT_FOUND      |
| 409  | BUDGET_ALREADY_EXISTS |
| 422  | VALIDATION_ERROR      |
| 500  | INTERNAL_SERVER_ERROR |

Responses follow `errors.md`.

---

# 15. Business Rules

- Users may manage only their own budgets.
- One active budget per category and period.
- Budget progress is calculated from transactions.
- Progress updates automatically after transaction changes.
- Alert notifications are generated when thresholds are crossed.
- Soft-deleted budgets are excluded from standard queries.

---

# 16. Design Principles

- RESTful resource design
- Automatic progress calculation
- Strong validation
- Soft delete support
- Event-driven updates
- Consistent response format
- User ownership enforcement

---

# References

- api_overview.md
- authentication.md
- pagination.md
- errors.md
- ../development/features/budgets.md

---

> **API Principle:** Budgets help users proactively manage spending. Every budget endpoint should maintain accurate progress calculations, enforce ownership, and automatically reflect changes caused by transaction updates.
