---
title: Database Relationships

module: database

version: 1.0.0

status: Locked

priority: Critical

owner: Database Team

related_docs:
  - database.md
  - tables.md
  - indexes.md
  - schema.sql
  - zentra_er_diagram.png
---

# Database Relationships

> This document defines all relationships between database tables in Zentra, including cardinality, ownership, foreign keys, and cascade behavior.

---

# Table of Contents

1. Purpose
2. Relationship Principles
3. Relationship Types
4. Core Relationships
5. Authentication Relationships
6. Finance Relationships
7. AI Relationships
8. Import Relationships
9. Notification Relationships
10. Cascade Rules
11. Referential Integrity Rules
12. Future Relationships
13. References

---

# 1. Purpose

This document defines how every table in Zentra is related.

It establishes:

- Foreign Keys
- Ownership
- Cardinality
- Cascade Rules
- Referential Integrity

Every relationship implemented in `schema.sql` must follow this document.

---

# 2. Relationship Principles

The database follows these principles:

- Every relationship uses a foreign key.
- Every child record belongs to exactly one parent.
- Foreign keys are immutable after creation unless explicitly required.
- Relationships must preserve referential integrity.
- Soft-deleted records remain linked.

---

# 3. Relationship Types

Version 1 uses:

## One-to-One (1:1)

Example

```
users

↓

user_settings
```

---

## One-to-Many (1:N)

Example

```
users

↓

transactions
```

---

Many-to-Many relationships are intentionally excluded from Version 1.

---

# 4. Core Relationships

---

## Users → Transactions

### Cardinality

```
1 User

↓

Many Transactions
```

### Foreign Key

```
transactions.user_id

↓

users.id
```

### Ownership

- Parent: users
- Child: transactions

### Delete Rule

Soft Delete

---

## Users → Categories

### Cardinality

```
1 User

↓

Many Categories
```

### Foreign Key

```
categories.user_id

↓

users.id
```

### Delete Rule

Soft Delete

---

## Categories → Transactions

### Cardinality

```
1 Category

↓

Many Transactions
```

### Foreign Key

```
transactions.category_id

↓

categories.id
```

### Delete Rule

Restrict

Categories cannot be permanently removed while referenced.

---

## Users → Budgets

### Cardinality

```
1 User

↓

Many Budgets
```

### Foreign Key

```
budgets.user_id

↓

users.id
```

---

## Categories → Budgets

### Cardinality

```
1 Category

↓

Many Budgets
```

### Foreign Key

```
budgets.category_id

↓

categories.id
```

---

## Users → Goals

### Cardinality

```
1 User

↓

Many Goals
```

### Foreign Key

```
goals.user_id

↓

users.id
```

---

# 5. Authentication Relationships

---

## Users → Refresh Tokens

### Cardinality

```
1 User

↓

Many Refresh Tokens
```

### Foreign Key

```
refresh_tokens.user_id

↓

users.id
```

### Delete Rule

Cascade Hard Delete

Expired tokens may be removed automatically.

---

# 6. Finance Relationships

---

## Users → Payment Intents

### Cardinality

```
1 User

↓

Many Payment Intents
```

### Foreign Key

```
payment_intents.user_id

↓

users.id
```

---

## Payment Intents → Transactions

### Cardinality

```
1 Payment Intent

↓

0 or 1 Transaction
```

### Purpose

Only successful reconciled payments generate transactions.

---

# 7. AI Relationships

---

## Users → AI Insights

### Cardinality

```
1 User

↓

Many AI Insights
```

### Foreign Key

```
ai_insights.user_id

↓

users.id
```

---

# 8. Import Relationships

---

## Users → CSV Imports

### Cardinality

```
1 User

↓

Many CSV Imports
```

### Foreign Key

```
csv_imports.user_id

↓

users.id
```

---

## Users → SMS Imports

### Cardinality

```
1 User

↓

Many SMS Imports
```

### Foreign Key

```
sms_imports.user_id

↓

users.id
```

---

# 9. Notification Relationships

---

## Users → Notifications

### Cardinality

```
1 User

↓

Many Notifications
```

### Foreign Key

```
notifications.user_id

↓

users.id
```

---

## Users → User Settings

### Cardinality

```
1 User

↓

1 User Settings
```

### Foreign Key

```
user_settings.user_id

↓

users.id
```

### Constraint

```
UNIQUE(user_id)
```

Every user owns exactly one settings record.

---

# 10. Cascade Rules

| Relationship | On Delete | On Update |
|--------------|-----------|-----------|
| Users → Transactions | Soft Delete | Restrict |
| Users → Categories | Soft Delete | Restrict |
| Categories → Transactions | Restrict | Cascade |
| Users → Budgets | Soft Delete | Restrict |
| Users → Goals | Soft Delete | Restrict |
| Users → Notifications | Soft Delete | Restrict |
| Users → AI Insights | Soft Delete | Restrict |
| Users → Payment Intents | Soft Delete | Restrict |
| Users → CSV Imports | Soft Delete | Restrict |
| Users → SMS Imports | Soft Delete | Restrict |
| Users → Refresh Tokens | Cascade | Cascade |
| Users → User Settings | Cascade | Cascade |

---

# 11. Referential Integrity Rules

Every foreign key must satisfy:

- Parent record exists.
- Child record references a valid UUID.
- Orphan records are prohibited.
- Database constraints enforce integrity.
- Application validation complements database validation.

Repositories must never bypass foreign key constraints.

---

# 12. Future Relationships

Future versions may introduce:

- Shared Wallets
- Family Accounts
- Investment Portfolios
- Bank Accounts
- Recurring Transactions
- Subscription Management

These relationships should preserve the current ownership model.

---

# References

- database.md
- tables.md
- schema.sql
- indexes.md
- zentra_er_diagram.png

---

> **Database Principle:** Every relationship in Zentra is explicit, enforced by foreign keys, and designed to preserve data integrity. Parent-child ownership is clearly defined, soft deletes maintain historical consistency, and referential integrity is enforced at both the database and application layers.