# 🗄️ Database Indexes & Optimization
---
title: Database Indexing Strategy

module: database

version: 1.0.0

status: Locked

priority: Critical

owner: Database Team

related_docs:
  - database.md
  - tables.md
  - relationships.md
  - schema.sql
  - ../architecture/backend_architecture.md
---

# Database Indexing Strategy

> This document defines the indexing strategy used throughout Zentra to optimize query performance while maintaining efficient write operations.

---

# Table of Contents

1. Purpose
2. Indexing Goals
3. Index Types
4. General Rules
5. Table Indexes
6. Composite Indexes
7. Unique Indexes
8. Partial Indexes
9. Performance Guidelines
10. Monitoring
11. Future Improvements
12. References

---

# 1. Purpose

Indexes improve query performance by reducing the amount of data PostgreSQL must scan.

This document standardizes:

- Primary indexes
- Foreign key indexes
- Composite indexes
- Unique indexes
- Partial indexes
- Query optimization

Every new table should follow this indexing strategy.

---

# 2. Indexing Goals

The indexing strategy aims to provide:

- Fast dashboard loading
- Efficient transaction searches
- Optimized filtering
- Fast joins
- Low query latency
- Balanced read/write performance

Indexes should improve read performance without introducing unnecessary write overhead.

---

# 3. Index Types

The following index types are used.

## Primary Index

Automatically created by the primary key.

Example

```
PRIMARY KEY(id)
```

---

## Foreign Key Index

Improves joins.

Example

```
transactions.user_id
```

---

## Composite Index

Used when multiple columns are queried together.

Example

```
(user_id, transaction_date)
```

---

## Unique Index

Guarantees uniqueness.

Example

```
users.email
```

---

## Partial Index

Indexes only active rows.

Example

```sql
WHERE deleted_at IS NULL
```

---

# 4. General Rules

Every table should follow these rules:

- Primary keys are indexed automatically.
- Every foreign key must have an index.
- Frequently filtered columns should be indexed.
- Frequently sorted columns should be indexed.
- Avoid indexing low-selectivity columns.
- Avoid duplicate indexes.
- Review indexes periodically.

---

# 5. Table Indexes

## users

| Index | Type | Purpose |
|---------|------|----------|
| pk_users | Primary | Primary Key |
| uq_users_email | Unique | Email lookup |
| idx_users_created_at | B-Tree | Admin reporting |

---

## categories

| Index | Type | Purpose |
|---------|------|----------|
| pk_categories | Primary | Primary Key |
| idx_categories_user | B-Tree | User categories |
| idx_categories_type | B-Tree | Filter by type |

---

## transactions

| Index | Type | Purpose |
|---------|------|----------|
| pk_transactions | Primary | Primary Key |
| idx_transactions_user | B-Tree | User lookup |
| idx_transactions_category | B-Tree | Category lookup |
| idx_transactions_date | B-Tree | Date filtering |
| idx_transactions_type | B-Tree | Income / Expense |
| idx_transactions_source | B-Tree | Import source |
| idx_transactions_payment_method | B-Tree | Payment filtering |

---

## budgets

| Index | Type | Purpose |
|---------|------|----------|
| pk_budgets | Primary | Primary Key |
| idx_budgets_user | B-Tree | User budgets |
| idx_budgets_category | B-Tree | Category budgets |

---

## goals

| Index | Type | Purpose |
|---------|------|----------|
| pk_goals | Primary | Primary Key |
| idx_goals_user | B-Tree | User goals |
| idx_goals_status | B-Tree | Goal filtering |

---

## payment_intents

| Index | Type | Purpose |
|---------|------|----------|
| pk_payment_intents | Primary | Primary Key |
| idx_payment_user | B-Tree | User lookup |
| idx_payment_status | B-Tree | Payment status |
| idx_payment_reference | Unique | Reconciliation |

---

## notifications

| Index | Type | Purpose |
|---------|------|----------|
| pk_notifications | Primary | Primary Key |
| idx_notifications_user | B-Tree | User notifications |
| idx_notifications_read | B-Tree | Read status |
| idx_notifications_created | B-Tree | Recent notifications |

---

## ai_insights

| Index | Type | Purpose |
|---------|------|----------|
| pk_ai_insights | Primary | Primary Key |
| idx_ai_user | B-Tree | User insights |
| idx_ai_priority | B-Tree | Priority filtering |

---

## csv_imports

| Index | Type | Purpose |
|---------|------|----------|
| pk_csv_imports | Primary | Primary Key |
| idx_csv_user | B-Tree | User imports |
| idx_csv_status | B-Tree | Import status |

---

## sms_imports

| Index | Type | Purpose |
|---------|------|----------|
| pk_sms_imports | Primary | Primary Key |
| idx_sms_user | B-Tree | User imports |

---

## refresh_tokens

| Index | Type | Purpose |
|---------|------|----------|
| pk_refresh_tokens | Primary | Primary Key |
| idx_refresh_user | B-Tree | User tokens |
| idx_refresh_expiry | B-Tree | Cleanup jobs |

---

## user_settings

| Index | Type | Purpose |
|---------|------|----------|
| pk_user_settings | Primary | Primary Key |
| uq_user_settings_user | Unique | One settings row per user |

---

# 6. Composite Indexes

The following composite indexes optimize common queries.

## Transactions

```sql
(user_id, transaction_date)
```

Dashboard loading.

---

```sql
(user_id, category_id)
```

Category analytics.

---

```sql
(user_id, transaction_type)
```

Income vs expense.

---

```sql
(user_id, payment_method)
```

Payment filtering.

---

## Notifications

```sql
(user_id, read_at)
```

Unread notification lookup.

---

## AI Insights

```sql
(user_id, priority)
```

Priority ordering.

---

# 7. Unique Indexes

Unique constraints include:

```sql
users.email
```

---

```sql
user_settings.user_id
```

---

```sql
payment_intents.payment_reference
```

---

Additional unique indexes may be introduced as new business rules require.

---

# 8. Partial Indexes

Partial indexes reduce index size by excluding inactive rows.

Examples:

```sql
CREATE INDEX idx_transactions_active
ON transactions(user_id)
WHERE deleted_at IS NULL;
```

---

```sql
CREATE INDEX idx_notifications_unread
ON notifications(user_id)
WHERE read_at IS NULL;
```

---

```sql
CREATE INDEX idx_goals_active
ON goals(user_id)
WHERE deleted_at IS NULL;
```

---

# 9. Performance Guidelines

Indexes should support:

- Dashboard queries
- Search
- Pagination
- Analytics
- AI context retrieval
- Budget calculations

Avoid:

- Full table scans
- Duplicate indexes
- Excessive composite indexes
- Indexing rarely queried columns

Every new index should be justified using query patterns or execution plans.

---

# 10. Monitoring

Indexes should be reviewed using:

- EXPLAIN ANALYZE
- pg_stat_user_indexes
- Slow query logs

Unused indexes should be removed after verification.

Fragmented indexes should be rebuilt during maintenance windows.

---

# 11. Future Improvements

Future enhancements may include:

- GIN indexes for full-text search
- BRIN indexes for large historical tables
- Materialized views
- Partition-specific indexes
- Expression indexes
- Trigram indexes for merchant search

Future optimizations should remain backward compatible.

---

# References

- database.md
- tables.md
- relationships.md
- schema.sql
- ../architecture/backend_architecture.md

---

> **Database Principle:** Indexes exist to accelerate real application queries, not every possible query. Every index should have a measurable performance benefit, be aligned with business use cases, and remain balanced against storage and write costs.