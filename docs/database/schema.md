---
title: Database Schema

module: database

version: 2.0.0

status: Locked

priority: Critical

owner: Backend Team

database: PostgreSQL 17+

related_docs:
  - database.md
  - relationships.md
  - tables.md
  - constraints.md
  - indexes.md
  - migrations.md
  - schema.sql
  - zentra_er_diagram.png
---

# Database Schema

> This document defines the logical and physical database schema for Zentra. It serves as the single source of truth for all database entities, relationships, constraints, indexing strategies, and data integrity rules.

---

# Table of Contents

1. Purpose
2. Design Goals
3. Database Overview
4. Entity Overview
5. Core Tables
6. Relationships
7. Naming Conventions
8. Common Columns
9. Enumerations
10. Constraints
11. Indexing Strategy
12. Transactions
13. PostgreSQL Features
14. Soft Deletes
15. Auditing
16. Migration Strategy
17. Future Tables

---

# 1. Purpose

The database schema is designed to:

- Ensure data consistency
- Support scalable financial operations
- Maintain referential integrity
- Optimize query performance
- Simplify future feature development
- Support AI-powered financial analysis

The schema should remain normalized while balancing read performance and maintainability.

---

# 2. Design Goals

The database should provide:

- ACID-compliant transactions
- Strong referential integrity
- Efficient analytical queries
- Optimized indexing
- Secure financial storage
- Flexible schema evolution
- AI-ready architecture

---

# 3. Database Overview

Database Engine

```
PostgreSQL 17+
```

Character Encoding

```
UTF-8
```

Locale

```
en_US.UTF-8
```

Timezone

```
UTC
```

Extensions

```
uuid-ossp
pgcrypto
pg_trgm
citext
unaccent
pg_stat_statements
```

Storage

```
PostgreSQL Default Storage
```

All tables use PostgreSQL transactional capabilities.

---

# 4. Entity Overview

```
Users
│
├── Categories
│
├── Transactions
│
├── Budgets
│
├── Goals
│
├── Notifications
│
├── Reports
│
├── AI Conversations
│
├── AI Embeddings
│
├── CSV Imports
│
└── SMS Imports
```

Each entity has one clearly defined responsibility.

---

# 5. Core Tables

## Users

Purpose

Stores registered users.

Representative fields

- id
- full_name
- email
- password_hash
- phone
- avatar_url
- preferred_currency
- timezone
- language
- created_at
- updated_at
- deleted_at

---

## Categories

Purpose

Stores income and expense categories.

Representative fields

- id
- user_id
- name
- type
- icon
- color
- is_default
- created_at
- updated_at

---

## Transactions

Purpose

Stores every financial transaction.

Representative fields

- id
- user_id
- category_id
- amount
- transaction_type
- payment_method
- merchant
- description
- notes
- transaction_date
- attachment_url
- created_at
- updated_at
- deleted_at

---

## Budgets

Purpose

Stores monthly and category budgets.

Representative fields

- id
- user_id
- category_id
- month
- amount
- spent_amount
- remaining_amount
- created_at
- updated_at

---

## Goals

Purpose

Stores savings goals.

Representative fields

- id
- user_id
- title
- description
- target_amount
- current_amount
- target_date
- status
- created_at
- updated_at

---

## Notifications

Purpose

Stores user notifications.

Representative fields

- id
- user_id
- title
- message
- type
- is_read
- created_at

---

## Reports

Purpose

Stores generated reports.

Representative fields

- id
- user_id
- report_type
- parameters
- file_url
- created_at

---

## AI Conversations

Purpose

Stores AI chat history.

Representative fields

- id
- user_id
- conversation_id
- role
- message
- model
- token_usage
- metadata
- created_at

---

## AI Embeddings

Purpose

Stores vector embeddings for semantic search.

Representative fields

- id
- user_id
- conversation_id
- embedding
- metadata
- created_at

---

## CSV Imports

Purpose

Tracks imported CSV files.

Representative fields

- id
- user_id
- filename
- total_records
- imported_records
- failed_records
- status
- created_at

---

## SMS Imports

Purpose

Tracks imported SMS messages.

Representative fields

- id
- user_id
- sender
- message
- parsed
- transaction_id
- created_at

---

# 6. Relationships

```
Users
│
├── Categories
├── Transactions
├── Budgets
├── Goals
├── Reports
├── Notifications
├── AI Conversations
├── AI Embeddings
├── CSV Imports
└── SMS Imports

Categories
│
└── Transactions

Transactions
│
└── Budgets (analytics)

Goals
│
└── Users

AI Conversations
│
└── AI Embeddings
```

All relationships are enforced through foreign keys.

---

# 7. Naming Conventions

Tables

```
snake_case

plural
```

Examples

```
users

transactions

budget_categories

ai_conversations
```

Columns

```
snake_case
```

Primary Key

```
id UUID
```

Foreign Keys

```
user_id

category_id

goal_id

transaction_id
```

UUID Strategy

Every table uses UUID as the primary key.

No SERIAL or BIGSERIAL IDs should be used unless explicitly documented.

---

# 8. Common Columns

Every major table should include

```
id UUID

created_at

updated_at

deleted_at
```

Audit timestamps use

```
TIMESTAMPTZ
```

to preserve timezone information.

---

# 9. Enumerations

Transaction Type

```
income

expense

transfer
```

Category Type

```
income

expense
```

Budget Status

```
active

completed

expired
```

Goal Status

```
active

completed

cancelled
```

Notification Type

```
system

security

goal

budget

transaction

ai
```

Import Status

```
pending

processing

completed

failed
```

---

# 10. Constraints

Representative constraints

- PRIMARY KEY
- FOREIGN KEY
- UNIQUE
- NOT NULL
- CHECK
- DEFAULT

Examples

Email

```
UNIQUE(email)
```

Amount

```
CHECK(amount > 0)
```

Transaction Type

```
CHECK(transaction_type IN (...))
```

Database constraints complement application validation.

---

# 11. Indexing Strategy

B-Tree

Used for

- Primary Keys
- Foreign Keys
- Dates
- Amounts

GIN

Used for

- JSONB
- Full Text Search

GiST

Reserved for

- Geospatial features
- Advanced similarity search

Composite Indexes

Examples

```
(user_id, transaction_date)

(user_id, category_id)

(user_id, created_at)
```

Partial Indexes

Examples

```
WHERE deleted_at IS NULL

WHERE status='active'
```

Indexes should be created based on actual query patterns.

---

# 12. Transactions

Database transactions should be used for

- Transaction creation
- Transfers
- Goal contributions
- Budget updates
- CSV imports
- SMS reconciliation
- AI logging

Isolation Level

```
READ COMMITTED
```

Higher isolation levels may be used for critical financial workflows.

---

# 13. PostgreSQL Features

The application leverages PostgreSQL capabilities.

UUID

All primary keys use UUID.

JSONB

Used for

- AI metadata
- Report parameters
- Import metadata
- Future integrations

Views

Representative views

- monthly_summary
- spending_analysis
- budget_progress

Materialized Views

Future optimization

- dashboard analytics
- AI insights
- reporting

Window Functions

Used for

- Running balances
- Rankings
- Monthly comparisons

CTEs

Used for

- Recursive reports
- Complex aggregations
- Financial analytics

pgvector

Used for

- AI memory
- Semantic search
- Retrieval-Augmented Generation (RAG)
- Personalized recommendations

---

# 14. Soft Deletes

Soft deletes should be enabled for

- Users
- Categories
- Transactions
- Goals

Deleted records remain recoverable.

---

# 15. Auditing

Critical events should be logged.

Representative audit events

- User Registration
- Login
- Password Reset
- Transaction Created
- Budget Updated
- Goal Completed
- CSV Import
- AI Request

Sensitive information must never be stored in audit logs.

---

# 16. Migration Strategy

Every schema change should be version-controlled.

Workflow

```
Design

↓

Migration

↓

Review

↓

Testing

↓

Deployment
```

Production databases should never be modified manually.

---

# 17. Future Tables

Planned future entities

- bank_accounts
- recurring_transactions
- subscriptions
- investments
- loans
- credit_cards
- audit_logs
- webhooks
- api_keys
- user_sessions
- exchange_rates
- shared_budgets
- financial_institutions
- recurring_rules

Future PostgreSQL enhancements

- Declarative Partitioning
- Logical Replication
- pgvector Scaling
- TimescaleDB Integration
- Read Replicas
- Row-Level Security (RLS)

---

# References

- database.md
- relationships.md
- tables.md
- constraints.md
- indexes.md
- migrations.md
- schema.sql
- zentra_er_diagram.png

---

> **Database Schema Principle:** Zentra's database is built on PostgreSQL using normalized relational design, UUID-based primary keys, strong referential integrity, ACID-compliant transactions, JSONB for flexible metadata, and pgvector for future AI capabilities. Every table has a single responsibility, schema changes are managed through migrations, and performance is achieved through carefully designed indexing, constraints, and PostgreSQL-native features.
