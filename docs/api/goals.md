# Goals API
---
title: Goals API

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
  - ../development/features/goals.md
  - ../development/features/transactions.md
---

# Goals API

> This document defines every endpoint related to savings goals in Zentra, including goal management, progress tracking, manual contributions, milestones, and completion.

---

# Table of Contents

1. Purpose
2. Authentication
3. Endpoints
4. Goal Model
5. Create Goal
6. Get Goals
7. Get Goal
8. Update Goal
9. Delete Goal
10. Contribute to Goal
11. Goal Progress
12. Query Parameters
13. Validation Rules
14. Response Examples
15. Error Responses
16. Business Rules
17. Design Principles

---

# 1. Purpose

The Goals API enables users to create and manage savings goals.

Version 1 supports:

- Goal creation
- Manual contributions
- Progress tracking
- Goal completion
- Goal summaries

Automatic contributions are not supported in Version 1.

---

# 2. Authentication

All endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users may access only their own goals.

---

# 3. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /goals | List goals |
| POST | /goals | Create goal |
| GET | /goals/{id} | Get goal |
| PATCH | /goals/{id} | Update goal |
| DELETE | /goals/{id} | Delete goal |
| POST | /goals/{id}/contribute | Add contribution |
| GET | /goals/{id}/progress | Goal progress |

---

# 4. Goal Model

A goal contains:

- Name
- Target Amount
- Current Amount
- Target Date
- Status
- Completion Percentage
- Notes

Possible status values:

- ACTIVE
- COMPLETED
- CANCELLED

---

# 5. Create Goal

## Endpoint

```http
POST /api/v1/goals
```

### Request

```json
{
  "name": "New Laptop",
  "targetAmount": 120000,
  "targetDate": "2027-03-31",
  "notes": "For work and development."
}
```

### Success

```http
201 Created
```

```json
{
  "success": true,
  "message": "Goal created successfully.",
  "data": {
    "id": "uuid"
  }
}
```

---

# 6. Get Goals

## Endpoint

```http
GET /api/v1/goals
```

Supports:

- Pagination
- Filtering
- Searching
- Sorting

Example

```http
GET /goals?status=ACTIVE
```

---

# 7. Get Goal

## Endpoint

```http
GET /api/v1/goals/{id}
```

Returns complete goal information including contribution history and progress.

---

# 8. Update Goal

## Endpoint

```http
PATCH /api/v1/goals/{id}
```

Example

```json
{
  "targetAmount": 140000,
  "targetDate": "2027-05-01"
}
```

Only supplied fields are updated.

---

# 9. Delete Goal

## Endpoint

```http
DELETE /api/v1/goals/{id}
```

Goals use soft delete.

Response

```json
{
  "success": true,
  "message": "Goal deleted successfully."
}
```

---

# 10. Contribute to Goal

## Endpoint

```http
POST /api/v1/goals/{id}/contribute
```

### Request

```json
{
  "amount": 5000,
  "notes": "Monthly savings"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Contribution added successfully.",
  "data": {
    "currentAmount": 35000,
    "completionPercentage": 29.17,
    "status": "ACTIVE"
  }
}
```

If the contribution reaches or exceeds the target amount, the goal is automatically marked as **COMPLETED**.

---

# 11. Goal Progress

## Endpoint

```http
GET /api/v1/goals/{id}/progress
```

Example Response

```json
{
  "success": true,
  "data": {
    "targetAmount": 120000,
    "currentAmount": 35000,
    "remainingAmount": 85000,
    "completionPercentage": 29.17,
    "status": "ACTIVE"
  }
}
```

---

# 12. Query Parameters

| Parameter | Description |
|-----------|-------------|
| status | ACTIVE, COMPLETED, CANCELLED |
| page | Page number |
| limit | Page size |
| search | Goal name |
| sort | Sort field |
| order | asc / desc |

---

# 13. Validation Rules

Validation includes:

- Goal name is required.
- Target amount must be greater than zero.
- Contribution amount must be greater than zero.
- Target date must not be in the past.
- Completed goals cannot receive additional contributions.
- Cancelled goals cannot be modified.

Validation failures return HTTP 422.

---

# 14. Response Examples

Single Goal

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Laptop",
    "targetAmount": 120000,
    "currentAmount": 35000,
    "completionPercentage": 29.17,
    "status": "ACTIVE"
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
    "total": 5
  }
}
```

---

# 15. Error Responses

| HTTP | Error Code |
|------|------------|
| 400 | BAD_REQUEST |
| 401 | UNAUTHORIZED |
| 403 | FORBIDDEN |
| 404 | GOAL_NOT_FOUND |
| 409 | GOAL_ALREADY_COMPLETED |
| 422 | VALIDATION_ERROR |
| 500 | INTERNAL_SERVER_ERROR |

Responses follow `errors.md`.

---

# 16. Business Rules

- Users may manage only their own goals.
- Goal progress is calculated from recorded contributions.
- Contributions cannot be negative.
- Goals automatically become **COMPLETED** when the target amount is reached.
- Soft-deleted goals are excluded from standard queries.
- Every successful contribution emits domain events for Dashboard, Analytics, and Notifications.

---

# 17. Design Principles

- RESTful resource design
- Strong validation
- Automatic progress calculation
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
- ../development/features/goals.md

---

> **API Principle:** Savings goals help users plan and monitor future financial objectives. Every goal operation should preserve data integrity, accurately track progress, enforce ownership, and automatically update dependent modules whenever contributions change.