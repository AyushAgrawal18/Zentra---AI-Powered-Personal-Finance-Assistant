# Feature Specification: Savings Goals
---
title: Goals Module

module: goals

version: 1.0.0

priority: P1

status: Completed

owner: Backend Team

frontend:
  - Goals
  - Goal Details
  - Create Goal

backend:
  - goals

database:
  - goals

apis:
  - GET /goals
  - POST /goals
  - PATCH /goals/:id
  - DELETE /goals/:id

dependencies:
  - Authentication
  - Transactions

used_by:
  - Dashboard
  - Analytics
  - AI Insights
  - Notifications

related_docs:
  - features/transactions.md
  - features/dashboard.md
  - api/goals.md
---

# Goals Module

Project: Zentra – AI Powered Financial Operating System

Version: 1.0.0

Priority: P1

Status: Completed

---

# Table of Contents

1. Overview
2. Objectives
3. Scope
4. Out of Scope
5. Business Value
6. Stakeholders
7. User Stories
8. Functional Requirements
9. Non Functional Requirements
10. Goal Types
11. Architecture
12. Database Design
13. API Specification
14. Validation Rules
15. Business Rules
16. Security
17. Testing Strategy
18. Future Scope
19. LLM Notes
20. Definition of Done

---

# 1. Overview

The Goals module enables users to define financial targets and monitor progress over time.

Examples

- Buy Laptop
- Europe Trip
- Emergency Fund
- New Bike
- New Phone
- House Down Payment

Goals provide users with motivation and visibility into long-term savings.

---

# 2. Objectives

The module shall provide:

- Savings goals
- Progress tracking
- Target dates
- Remaining amount
- Goal completion
- Goal analytics
- Notifications

---

# 3. Scope

Version 1

✅ Create Goal

✅ Edit Goal

✅ Delete Goal

✅ Goal Progress

✅ Completion Tracking

---

# 4. Out of Scope

Version 1 excludes

- Investment Goals
- Shared Goals
- Family Goals
- Automatic Transfers
- AI Goal Suggestions

---

# 5. Business Value

Goals encourage disciplined saving by giving users a measurable financial target.

Progress is automatically updated based on user actions.

---

# 6. Stakeholders

| Stakeholder | Responsibility |
|-------------|---------------|
| User | Create and manage goals |
| Dashboard | Show progress |
| AI | Suggest improvements |
| Notifications | Send reminders |

---

# 7. User Stories

US-501

As a user,

I want to create a savings goal,

so I can monitor my progress.

---

US-502

As a user,

I want to know how much is left,

so I can plan future savings.

---

US-503

As a user,

I want a notification when my goal is completed.

---

# 8. Functional Requirements

FR-501

Create Goal

Input

- Name
- Target Amount
- Target Date
- Description

---

FR-502

Edit Goal

---

FR-503

Delete Goal

Soft delete.

---

FR-504

View Goal

Display

- Progress
- Remaining
- Completion %

---

FR-505

Goal Completion

Automatically detect when target amount is achieved.

---

# 9. Non Functional Requirements

Response Time

<200 ms

Availability

99.9%

---

# 10. Goal Types

Version 1

- Savings Goal

Future

- Investment Goal
- Debt Payoff Goal
- Recurring Goal

---

# 11. Architecture

```
Transactions

↓

Savings Engine

↓

Goal Progress

↓

Dashboard

↓

Notifications

↓

AI
```

---

# 12. Database Design

Table

goals

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| title | VARCHAR(100) |
| target_amount | NUMERIC(12,2) |
| target_date | DATE |
| description | TEXT |
| status | ENUM |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| is_deleted | BOOLEAN |

**Do not store `saved_amount` or `remaining_amount`.** Calculate them from related transactions or explicit goal contributions to avoid inconsistencies.

---

# 13. API Specification

GET /goals

POST /goals

PATCH /goals/:id

DELETE /goals/:id

GET /goals/:id

---

# 14. Validation Rules

Target Amount

> ₹0

Title

2–100 characters

Target Date

Must be today or a future date

---

# 15. Business Rules

- Goal title must be unique per user.
- Soft delete only.
- Progress updates automatically when relevant transactions or goal contributions change.
- A completed goal cannot automatically revert to active without user confirmation if later edits reduce progress.
- Goal completion triggers a notification.

---

# 16. Security

- JWT Authentication
- Ownership Validation
- Input Validation

---

# 17. Testing Strategy

- Create Goal
- Edit Goal
- Delete Goal
- Progress Calculation
- Goal Completion
- Notifications

---

# 18. Future Scope

- AI Recommendations
- Shared Goals
- Automatic Savings
- Bank Integration
- Goal Templates

---

# 19. LLM Notes

Mandatory Rules

- Never hard delete goals.
- Always verify ownership.
- Never trust frontend validation.
- Keep goal calculations deterministic.
- Use standardized API responses.
- Keep business logic inside the service layer.

---

# 20. Definition of Done

Backend

- CRUD APIs
- Goal calculation
- Notifications

Frontend

- Goal List
- Goal Details
- Create/Edit Goal
- Progress Visualization

Database

- Table created
- Constraints applied
- Indexes added

Testing

- Unit Tests
- Integration Tests
- API Tests

Documentation

- Feature complete
- API complete
- Database complete

---

# References

- docs/features/transactions.md
- docs/features/dashboard.md
- docs/api/goals.md
- docs/database/database.md


> Goals should always derive their progress from financial activity rather than relying on manually maintained totals. This keeps the module consistent, auditable, and aligned with the rest of Zentra's architecture.