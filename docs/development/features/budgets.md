# Feature Specification: Budgets
---
title: Budgets Module

module: budgets

version: 1.0.0

priority: P0

status: Planned

owner: Backend Team

frontend:
  - Budgets
  - Create Budget
  - Budget Details

backend:
  - budgets

database:
  - budgets

apis:
  - GET /budgets
  - POST /budgets
  - PATCH /budgets/:id
  - DELETE /budgets/:id

dependencies:
  - Authentication
  - Transactions
  - Categories

used_by:
  - Dashboard
  - Analytics
  - AI
  - Notifications

related_docs:
  - features/transactions.md
  - features/categories.md
  - api/budgets.md
  - database/database.md
---

# Budgets Module

> Project: Zentra – AI Powered Financial Operating System

Version: 1.0.0

Priority: P0

Status: Planned

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
10. Budget Types
11. Architecture
12. Database Design
13. API Specification
14. Validation Rules
15. Business Rules
16. Security
17. Testing Strategy
18. Future Scope
19. LLM Implementation Notes
20. Definition of Done

---

# 1. Overview

The Budgets module enables users to define spending limits and monitor expenses across different categories and time periods.

Budgets are automatically updated whenever related transactions are created, updated, deleted, or reconciled.

The module powers:

- Dashboard
- Budget Alerts
- AI Insights
- Monthly Reports
- Spending Analytics

---

# 2. Objectives

The module shall provide:

- Monthly budgets
- Category-wise budgets
- Budget tracking
- Budget progress
- Overspending alerts
- Remaining balance calculation
- Budget history

---

# 3. Scope

Version 1 includes

✅ Monthly Budgets

✅ Category Budgets

✅ Budget Progress

✅ Budget Alerts

✅ Budget History

---

# 4. Out of Scope

Version 1 excludes

- Shared Budgets
- Family Budgets
- Weekly Budgets
- Daily Budgets
- AI Budget Suggestions
- Budget Templates

---

# 5. Business Value

Budgets help users control spending by comparing actual expenses with predefined limits.

The system provides real-time updates and alerts before the budget is exceeded.

---

# 6. Stakeholders

| Stakeholder | Responsibility |
|-------------|---------------|
| User | Create and manage budgets |
| Transactions | Update spending |
| Dashboard | Display progress |
| Analytics | Generate reports |
| Notifications | Send alerts |
| AI | Generate recommendations |

---

# 7. User Stories

## US-401

As a user,

I want to create a monthly budget,

so I can control my expenses.

---

## US-402

As a user,

I want category-specific budgets,

so I know how much I spend on Food, Travel, Shopping, etc.

---

## US-403

As a user,

I want to receive alerts before exceeding my budget,

so I can adjust my spending.

---

## US-404

As a user,

I want to see remaining budget,

so I know how much I can still spend.

---

# 8. Functional Requirements

## FR-401

Create Budget

Input

- Category
- Budget Amount
- Month
- Year

---

## FR-402

Update Budget

Editable

- Amount
- Alert Threshold

---

## FR-403

Delete Budget

Soft delete only.

---

## FR-404

View Budget

Display

- Budget Amount
- Amount Spent
- Remaining
- Percentage Used

---

## FR-405

Budget Alerts

Notify user when

- 80% used
- 90% used
- 100% reached
- Budget exceeded

---

# 9. Non Functional Requirements

Response Time

<200 ms

Availability

99.9%

Scalable to

100 Budgets per User

---

# 10. Budget Types

Supported

- Monthly Overall Budget
- Monthly Category Budget

Future

- Weekly Budget
- Daily Budget
- Yearly Budget

---

# 11. Architecture

```
Transactions

↓

Budget Engine

↓

Update Budget

↓

Dashboard

↓

Notifications

↓

AI Insights
```

The Budget Engine is responsible for recalculating affected budgets whenever a transaction changes.

---

# 12. Database Design

Table

budgets

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| category_id | UUID (nullable for overall budget) |
| amount | NUMERIC(12,2) |
| spent_amount | NUMERIC(12,2) |
| alert_threshold | INTEGER |
| month | INTEGER |
| year | INTEGER |
| is_deleted | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

Relationship

```
users

1

↓

∞

budgets
```

```
categories

1

↓

∞

budgets
```

---

# 13. API Specification

| Method | Endpoint | Description |
|----------|----------|-------------|
| GET | /budgets | List Budgets |
| GET | /budgets/:id | Budget Details |
| POST | /budgets | Create Budget |
| PATCH | /budgets/:id | Update Budget |
| DELETE | /budgets/:id | Delete Budget |

---

# 14. Validation Rules

Budget Amount

- Required
- Greater than ₹0

Month

- 1–12

Year

- Current or future

Alert Threshold

Allowed

- 50
- 80
- 90
- 100

Category

Must exist and belong to the user (or be a system category).

---

# 15. Business Rules

BR-401

A user can have only one budget per category per month.

---

BR-402

Spent amount is automatically calculated from transactions.

Users cannot edit spent_amount manually.

---

BR-403

Deleting a transaction updates the budget automatically.

---

BR-404

Income transactions never count toward expense budgets.

---

BR-405

Only expense categories are eligible for expense budgets in Version 1.

---

BR-406

Budget alerts are sent only once per threshold to avoid notification spam.

---

# 16. Security

- JWT Authentication required
- Ownership validation required
- Input validation mandatory
- Audit all create, update, and delete operations

---

# 17. Testing Strategy

Unit Tests

- Create Budget
- Update Budget
- Delete Budget
- Budget Calculation

Integration Tests

- Transaction → Budget Update
- Budget → Dashboard
- Budget → Notification

Performance Tests

- 100 Budgets
- 1 Million Transactions

---

# 18. Future Scope

- AI Budget Suggestions
- Smart Budget Recommendations
- Weekly Budgets
- Daily Budgets
- Shared Budgets
- Budget Templates
- Budget Carry Forward

---

# 19. LLM Implementation Notes

Mandatory Rules

- Never allow duplicate budgets for the same category, month, and year.
- Never allow manual updates to spent_amount.
- Always calculate spending from transactions.
- Ignore deleted transactions during calculations.
- Ignore income transactions for expense budgets.
- Trigger dashboard and analytics refresh after recalculation.
- Use background jobs for heavy recalculations if needed.
- Return standardized API responses.

---

# 20. Definition of Done

Backend

- CRUD APIs implemented
- Automatic recalculation implemented
- Budget alerts implemented

Frontend

- Budget List
- Create Budget
- Edit Budget
- Budget Progress Bar
- Alert Indicators

Database

- Table created
- Constraints applied
- Indexes added

Security

- JWT Authentication
- Ownership Validation

Testing

- Unit Tests
- Integration Tests
- Performance Tests

Documentation

- API Documentation complete
- Database Documentation complete
- Feature Documentation complete

---

# References

- docs/features/transactions.md
- docs/features/categories.md
- docs/features/dashboard.md
- docs/api/budgets.md
- docs/database/database.md


> This document defines the complete Budgets module specification for Zentra. Budget calculations must always be transaction-driven to ensure financial consistency throughout the application.