---
title: Database Tables

module: database

version: 1.0.0

status: Locked

priority: Critical

owner: Database Team

related_docs:
  - database.md
  - relationships.md
  - indexes.md
  - schema.sql
  - ../development/features/transactions.md
---

# Database Tables

> This document serves as the master data dictionary for Zentra. It defines every table, its purpose, ownership, relationships, and lifecycle.

---

# Table of Contents

1. Purpose
2. Table Naming Rules
3. Core Tables
4. Authentication Tables
5. Finance Tables
6. AI Tables
7. Import Tables
8. Notification Tables
9. System Tables
10. Audit Strategy
11. References

---

# 1. Purpose

This document defines every table used in Zentra.

For each table, it specifies:

- Business purpose
- Owner module
- Primary key
- Foreign keys
- Major columns
- Relationships
- Lifecycle

Detailed SQL definitions belong in `schema.sql`.

---

# 2. Table Naming Rules

All tables:

- use plural names
- use snake_case
- use UUID primary keys
- include audit timestamps
- support soft deletes where applicable

Example:

```
users
transactions
payment_intents
ai_insights
```

---

# 3. Core Tables

---

## users

### Purpose

Stores registered user accounts.

### Owner

Authentication Module

### Primary Key

```
id (UUID)
```

### Important Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| full_name | VARCHAR | User name |
| email | VARCHAR | Unique email |
| password_hash | TEXT | Bcrypt hash |
| avatar_url | TEXT | Profile image |
| currency | VARCHAR | Preferred currency |
| timezone | VARCHAR | User timezone |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |
| deleted_at | TIMESTAMP | Soft delete |

### Relationships

```
1 User

↓

Many Transactions

Many Budgets

Many Goals

Many Notifications

Many AI Insights
```

---

## categories

### Purpose

Stores transaction categories.

Examples:

- Food
- Salary
- Rent
- Travel

### Owner

Categories Module

### Primary Key

```
id (UUID)
```

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| name | VARCHAR |
| type | ENUM |
| icon | VARCHAR |
| color | VARCHAR |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

## transactions

### Purpose

Stores every financial transaction.

### Owner

Transactions Module

### Primary Key

```
id (UUID)
```

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| category_id | UUID |
| merchant_name | VARCHAR |
| amount | NUMERIC |
| transaction_type | ENUM |
| payment_method | ENUM |
| source | ENUM |
| notes | TEXT |
| transaction_date | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

### Relationships

```
Many Transactions

↓

One User

↓

One Category
```

---

## budgets

### Purpose

Stores user budget limits.

### Owner

Budget Module

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| category_id | UUID |
| amount | NUMERIC |
| period | ENUM |
| start_date | DATE |
| end_date | DATE |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

## goals

### Purpose

Stores savings goals.

### Owner

Goals Module

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| name | VARCHAR |
| target_amount | NUMERIC |
| current_amount | NUMERIC |
| target_date | DATE |
| status | ENUM |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

# 4. Authentication Tables

---

## refresh_tokens

### Purpose

Stores refresh tokens.

### Owner

Authentication

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| token_hash | TEXT |
| expires_at | TIMESTAMP |
| revoked_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

# 5. Finance Tables

---

## payment_intents

### Purpose

Tracks initiated UPI payments.

### Owner

Payments Module

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| amount | NUMERIC |
| merchant_name | VARCHAR |
| upi_id | VARCHAR |
| status | ENUM |
| payment_reference | VARCHAR |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# 6. AI Tables

---

## ai_insights

### Purpose

Stores generated financial insights.

### Owner

AI Insights Module

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| title | VARCHAR |
| message | TEXT |
| insight_type | ENUM |
| priority | ENUM |
| generated_at | TIMESTAMP |
| expires_at | TIMESTAMP |
| viewed_at | TIMESTAMP |

---

# 7. Import Tables

---

## csv_imports

### Purpose

Tracks uploaded CSV files.

### Owner

CSV Import Module

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| filename | VARCHAR |
| bank_name | VARCHAR |
| status | ENUM |
| total_records | INTEGER |
| imported_records | INTEGER |
| created_at | TIMESTAMP |

---

## sms_imports

### Purpose

Stores SMS import sessions.

### Owner

SMS Import Module

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| sms_count | INTEGER |
| detected_transactions | INTEGER |
| imported_transactions | INTEGER |
| created_at | TIMESTAMP |

---

# 8. Notification Tables

---

## notifications

### Purpose

Stores user notifications.

### Owner

Notification Module

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| title | VARCHAR |
| message | TEXT |
| notification_type | ENUM |
| priority | ENUM |
| read_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

# 9. System Tables

---

## user_settings

### Purpose

Stores application preferences.

### Owner

Settings Module

### Important Columns

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| theme | ENUM |
| language | VARCHAR |
| currency | VARCHAR |
| notifications_enabled | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# 10. Audit Strategy

Business tables include:

- created_at
- updated_at
- deleted_at

Authentication tables additionally include:

- expires_at
- revoked_at

Operational tables may include:

- processed_at
- completed_at
- failed_at

---

# References

- database.md
- relationships.md
- indexes.md
- schema.sql

---

> **Database Principle:** Every table has a single business responsibility, is owned by one feature module, and participates in clearly defined relationships. The schema is normalized, auditable, and designed for long-term maintainability.