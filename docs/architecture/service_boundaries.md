---
title: Service Boundaries

module: architecture

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - architecture/events.md
  - architecture/background_jobs.md
  - features/transactions.md
  - features/budgets.md
  - features/goals.md
---

# Service Boundaries

> This document defines ownership boundaries for every module in Zentra.

---

# Table of Contents

1. Purpose
2. Why Service Boundaries?
3. Design Principles
4. Module Ownership
5. Allowed Dependencies
6. Forbidden Dependencies
7. Shared Services
8. Communication Rules
9. Data Ownership
10. Examples
11. LLM Rules
12. Definition of Done

---

# 1. Purpose

Every module in Zentra owns a specific business domain.

A module may expose APIs and events.

A module must never manipulate another module's internal data.

---

# 2. Why Service Boundaries?

Without boundaries

```
Transactions

↓

Dashboard

↓

Budget

↓

Analytics

↓

AI

↓

Notifications
```

Everything becomes tightly coupled.

Instead

```
Transaction

↓

Event

↓

Consumers
```

Every module remains independent.

---

# 3. Design Principles

Every module must follow these principles.

## Single Responsibility

Each module owns exactly one business capability.

Examples

Authentication

↓

Identity

Transactions

↓

Financial Records

Budgets

↓

Spending Limits

Goals

↓

Savings Targets

Analytics

↓

Reports

Dashboard

↓

Presentation

---

## High Cohesion

All logic related to a feature stays inside that feature.

Example

Budget calculations belong inside

```
Budget Module
```

Not

```
Dashboard Module
```

---

## Low Coupling

Modules communicate through

- Events
- Public Service APIs

Never through database access.

---

# 4. Module Ownership

---

## Authentication Module

Owns

- Registration
- Login
- Logout
- JWT
- Sessions
- Email Verification
- Password Reset

Does NOT own

- User Profile
- Notifications

---

## User Module

Owns

- Profile
- Avatar
- Preferences
- Currency
- Timezone

Does NOT own

- Authentication

---

## Transactions Module

Owns

- Income
- Expenses
- Merchant
- Payment Method
- Notes
- Import Source
- Tags
- Duplicate Detection

Does NOT own

- Dashboard
- Budget
- Analytics
- AI

---

## Categories Module

Owns

- System Categories
- Custom Categories
- Icons
- Colors

Does NOT own

- Transactions

---

## Budget Module

Owns

- Budget Definitions
- Budget Rules
- Thresholds
- Budget Alerts

Does NOT own

- Transactions

---

## Goals Module

Owns

- Goal Definitions
- Goal Contributions
- Goal Progress
- Goal Completion

Does NOT own

- Transactions

---

## Dashboard Module

Owns

Presentation only.

Displays

- Balance
- Recent Transactions
- Budget Cards
- Goal Cards
- Charts

Dashboard stores no business data.

---

## Analytics Module

Owns

- Charts
- Monthly Reports
- Trends
- Spending Analysis

Does NOT own

- Transactions

Analytics only reads.

---

## AI Module

Owns

- Chat
- Insights
- Recommendations
- Financial Summary

AI never modifies financial data.

---

## Notifications Module

Owns

- Push Notifications
- Email Notifications
- Budget Alerts
- Goal Alerts

---

## Payments Module

Owns

- UPI Deep Links
- Payment Intents
- Payment Status

Does NOT own

- Transactions

Payments emit events.

Transactions decide whether to create records.

---

## CSV Module

Owns

- CSV Upload
- CSV Parsing
- Validation

Never inserts directly into database.

Produces transaction import requests.

---

## SMS Module

Owns

- SMS Parsing
- Merchant Detection
- Amount Detection

Never creates transactions automatically.

User confirmation is mandatory.

---

# 5. Allowed Dependencies

```
Dashboard

↓

Transactions

Budgets

Goals

Analytics
```

Dashboard may read.

Never modify.

---

```
Budgets

↓

Transactions
```

Read only.

---

```
Goals

↓

Goal Contributions
```

Read only.

---

```
AI

↓

Everything

(Read Only)
```

AI never writes.

---

# 6. Forbidden Dependencies

Transactions

❌ Dashboard Database

❌ Budget Database

❌ Analytics Database

---

Dashboard

❌ Update Transactions

---

Analytics

❌ Modify Transactions

---

AI

❌ Update Database

---

Notifications

❌ Modify Budgets

---

CSV

❌ Direct Database Writes

---

SMS

❌ Auto Create Transactions

---

# 7. Shared Services

Some services may be shared.

Examples

```
Logger

Event Bus

Email

Storage

Cache

Configuration

Validation

Date Utilities
```

Shared services contain no business logic.

---

# 8. Communication Rules

Preferred

```
Event Bus
```

Alternative

```
Public Service API
```

Never

```
Database Access Across Modules
```

Bad

```
Dashboard

↓

SELECT *

FROM Transactions
```

Good

```
Dashboard Service

↓

Transaction Service

↓

Repository
```

Or

```
Dashboard Listener

↓

transaction.created
```

---

# 9. Data Ownership

Each table belongs to exactly one module.

| Table | Owner |
|---------|------|
| users | Authentication/User |
| refresh_tokens | Authentication |
| transactions | Transactions |
| categories | Categories |
| budgets | Budgets |
| goals | Goals |
| goal_contributions | Goals |
| payment_intents | Payments |
| notifications | Notifications |

No other module may directly modify these tables.

---

# 10. Examples

Example

Transaction Created

Bad

```
Transaction Service

↓

Budget Table

↓

Goal Table

↓

Dashboard Table
```

Good

```
Transaction Service

↓

Transaction Table

↓

Emit Event

↓

Budget Listener

↓

Goal Listener

↓

Dashboard Listener
```

---

# 11. LLM Rules

Mandatory

- Respect service ownership.
- Never access another module's repository directly.
- Never duplicate business logic.
- Prefer events over direct service calls.
- Controllers remain thin.
- Services own business rules.
- Repositories own persistence.
- Shared services contain no feature-specific logic.

---

# 12. Definition of Done

The architecture is complete when:

- Every module has a clearly defined owner.
- Responsibilities do not overlap.
- Dependencies are documented.
- Cross-module communication uses events or public APIs.
- No module directly modifies another module's tables.
- Documentation is kept in sync with implementation.

---

# References

- docs/architecture/events.md
- docs/architecture/background_jobs.md
- docs/features/transactions.md
- docs/features/budgets.md
- docs/features/goals.md

---

> **Architecture Rule #1**
>
> **If you're unsure where a piece of logic belongs, place it in the module that owns the business domain—not in the module that happens to use the data.**