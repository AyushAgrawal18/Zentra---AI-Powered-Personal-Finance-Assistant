# Feature Specification: Categories
---
title: Categories Module

module: categories

version: 1.0.0

priority: P0

status: Planned

owner: Backend Team

frontend:
  - Categories
  - Add Category
  - Edit Category

backend:
  - categories

database:
  - categories

apis:
  - GET /categories
  - POST /categories
  - PATCH /categories/:id
  - DELETE /categories/:id

dependencies:
  - Authentication

used_by:
  - Transactions
  - Dashboard
  - Budgets
  - Goals
  - Analytics
  - AI
  - Reports

related_docs:
  - features/transactions.md
  - features/budgets.md
  - api/categories.md
  - database/database.md
---

# Categories Module

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
10. Category Types
11. Category Architecture
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

The Categories module provides the classification system for all financial transactions.

Every transaction must belong to one category.

Categories enable:

- Dashboard charts
- Budget calculations
- Spending analysis
- AI recommendations
- Reports
- Monthly summaries

Without categories, financial analytics become meaningless.

---

# 2. Objectives

The module shall provide:

- System Categories
- Custom Categories
- Category Icons
- Category Colors
- Category CRUD
- Category Search
- Category Validation

---

# 3. Scope

Version 1

✅ View Categories

✅ Create Custom Categories

✅ Edit Categories

✅ Disable Categories

✅ Category Icons

✅ Category Colors

---

# 4. Out of Scope

Version 1 excludes

- Nested Categories
- Category Groups
- AI Auto Categorization
- Shared Categories
- Multi-language Categories

---

# 5. Business Value

Categories transform raw transaction data into meaningful financial insights.

Examples

Food → ₹8,500

Shopping → ₹4,200

Travel → ₹2,300

Without categorization, budgeting and analytics are significantly less useful.

---

# 6. Stakeholders

| Stakeholder | Responsibility |
|--------------|---------------|
| User | Manage Categories |
| Transactions | Assign Categories |
| Budgets | Track Spending |
| Dashboard | Display Charts |
| AI | Generate Insights |

---

# 7. User Stories

## US-301

As a user,

I want to create my own category,

so I can organize transactions.

---

## US-302

As a user,

I want category icons,

so transactions are easier to identify.

---

## US-303

As a user,

I want category colors,

so charts are visually meaningful.

---

## US-304

As a user,

I want to disable unused categories,

so they no longer appear when creating transactions.

---

# 8. Functional Requirements

---

## FR-301

View Categories

Display all active categories.

---

## FR-302

Create Category

Input

- Name
- Type
- Icon
- Color

---

## FR-303

Update Category

Editable

- Name
- Icon
- Color

---

## FR-304

Delete Category

System Categories

❌ Cannot be deleted.

Custom Categories

Soft delete only.

---

## FR-305

Category Search

Search by

- Name

---

## FR-306

Category Sorting

Sort by

- Name
- Usage Count
- Recently Created

---

# 9. Non Functional Requirements

Response Time

<200ms

Availability

99.9%

Supports

500 Categories per User

---

# 10. Category Types

## Income Categories

- Salary
- Freelance
- Bonus
- Interest
- Investment
- Gift
- Refund
- Other Income

---

## Expense Categories

- Food
- Travel
- Shopping
- Entertainment
- Utilities
- Medical
- Education
- Rent
- Fuel
- Groceries
- Insurance
- EMI
- Taxes
- Charity
- Other Expense

Users can create additional categories.

---

# 11. Category Architecture

```
User

↓

Categories

↓

Transactions

↓

Budgets

↓

Analytics

↓

Dashboard

↓

AI
```

Categories are referenced by every financial module.

---

# 12. Database Design

Table

categories

| Column | Type |
|----------|------|
| id | UUID |
| user_id | UUID (NULL for system categories) |
| name | VARCHAR(100) |
| type | income / expense |
| icon | VARCHAR(50) |
| color | VARCHAR(20) |
| is_system | BOOLEAN |
| is_deleted | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

Relationship

```
categories

1

↓

∞

transactions
```

---

# 13. API Specification

| Method | Endpoint | Description |
|----------|----------|-------------|
| GET | /categories | List Categories |
| POST | /categories | Create Category |
| PATCH | /categories/:id | Update Category |
| DELETE | /categories/:id | Soft Delete |

---

# 14. Validation Rules

Category Name

Required

2–100 characters

Unique per user and type

---

Icon

Required

Must exist in supported icon library

---

Color

Must be a valid HEX color.

Example

```
#3B82F6
```

---

Type

Allowed

```
income

expense
```

---

# 15. Business Rules

BR-301

Every transaction must reference exactly one category.

---

BR-302

System categories cannot be deleted.

---

BR-303

Deleting a custom category is a soft delete.

---

BR-304

If a category is in use by transactions, it cannot be permanently removed.

Users may disable it instead.

---

BR-305

Category type cannot be changed if transactions already exist.

Changing an income category to an expense category (or vice versa) would invalidate historical analytics.

---

# 16. Security

Authentication required.

Users can access only:

- Their own custom categories
- Global system categories

Ownership validation is mandatory before update or delete operations.

---

# 17. Testing Strategy

Unit Tests

- Create
- Update
- Delete
- Search

Integration Tests

- Category → Transaction
- Category → Budget
- Category → Dashboard

Performance Tests

500 Categories

10,000 Transactions

Search latency

---

# 18. Future Scope

- Category Groups
- Nested Categories
- AI Auto Categorization
- Smart Merchant Mapping
- Favorite Categories
- Category Templates

---

# 19. LLM Implementation Notes

Mandatory Rules

- Never allow transactions without a category.
- Never hard delete categories.
- Preserve system categories.
- Use UUID as primary key.
- Validate icon names.
- Validate HEX color codes.
- Prevent duplicate category names within the same type for a user.
- Always verify category ownership before updates.
- Return standardized API responses.

---

# 20. Definition of Done

Backend

- CRUD APIs implemented
- Validation complete
- Soft delete implemented

Frontend

- Category List
- Create Category
- Edit Category
- Delete Confirmation
- Search

Database

- Table created
- Indexes added
- Constraints applied

Security

- JWT Authentication
- Ownership Validation

Testing

- Unit tests
- Integration tests
- API tests

Documentation

- API documentation complete
- Database documentation complete
- Feature documentation complete

---

# References

- docs/features/transactions.md
- docs/features/budgets.md
- docs/api/categories.md
- docs/database/database.md
- docs/security/validation.md

---

> This document defines the complete Categories module specification for Zentra. Every transaction, budget, analytics report, and AI insight relies on this categorization system.