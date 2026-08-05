---
title: Repository Pattern

module: architecture

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - architecture.md
  - backend_architecture.md
  - service_boundaries.md
  - events.md
---

# Repository Pattern

> This document defines how data flows through the backend and the responsibilities of each application layer.

---

# Table of Contents

1. Overview
2. Design Principles
3. Layer Architecture
4. Request Lifecycle
5. Layer Responsibilities
6. Layer Restrictions
7. Data Flow Rules
8. Error Handling
9. Database Transactions
10. Repository Standards
11. Service Standards
12. Controller Standards
13. Anti Patterns
14. Examples
15. Testing
16. Definition of Done

---

# 1. Overview

Zentra follows the Repository Pattern to separate business logic from database operations.

Every HTTP request follows the same architecture.

```
Request
    ↓
Route
    ↓
Middleware
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

Each layer has one responsibility.

No layer should perform the responsibility of another.

---

# 2. Design Principles

The architecture follows these principles.

- Single Responsibility Principle
- Separation of Concerns
- Thin Controllers
- Rich Services
- Simple Repositories
- Dependency Direction Downwards
- Event Driven Communication

---

# 3. Layer Architecture

```
Client
   │
   ▼
Routes
   │
   ▼
Middleware
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
PostgreSQL
```

Responses travel in the reverse direction.

---

# 4. Request Lifecycle

A request should always follow this sequence.

```
HTTP Request

↓

Authentication

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Repository

↓

Service

↓

Controller

↓

HTTP Response
```

No shortcuts are allowed.

---

# 5. Layer Responsibilities

## Routes

Responsible for

- Registering endpoints
- Applying middleware
- API versioning

Routes should contain no logic.

---

## Middleware

Responsible for

- Authentication
- Authorization
- Validation
- Rate Limiting
- Logging
- Error Handling

Middleware should not contain business logic.

---

## Controller

Responsible for

- Reading request data
- Calling service methods
- Returning standardized responses

Controllers should remain thin.

---

## Service

Responsible for

- Business rules
- Application workflows
- Calling repositories
- Managing database transactions
- Emitting domain events

Business logic belongs here.

---

## Repository

Responsible for

- SQL queries
- CRUD operations
- Pagination
- Filtering
- Sorting

Repositories only communicate with PostgreSQL.

---

# 6. Layer Restrictions

## Routes must never

- Execute SQL
- Access PostgreSQL
- Perform calculations

---

## Controllers must never

- Write SQL
- Emit events
- Send notifications
- Call AI providers
- Perform business calculations

---

## Services must never

- Return Express responses
- Access HTTP objects
- Write raw SQL

---

## Repositories must never

- Know Express
- Know JWT
- Emit events
- Send notifications
- Perform business validation

---

# 7. Data Flow Rules

Data always moves downward.

```
Controller

↓

Service

↓

Repository
```

Repositories never call services.

Controllers never call repositories.

Routes never call services directly.

---

# 8. Error Handling

Repositories throw database errors.

Services convert database errors into business errors.

Controllers convert business errors into HTTP responses.

Example

```
Database Error

↓

Repository

↓

Service

↓

Business Error

↓

Controller

↓

HTTP Response
```

---

# 9. Database Transactions

Only the Service layer may begin database transactions.

Example

```
BEGIN

↓

Repository A

↓

Repository B

↓

Repository C

↓

COMMIT

↓

Emit Event
```

If any operation fails

```
ROLLBACK
```

Repositories must never commit transactions independently.

---

# 10. Repository Standards

Repositories should expose business-oriented methods.

Examples

```javascript
findById()

findByUser()

create()

update()

softDelete()

search()

paginate()
```

Repositories should

- Use parameterized queries
- Return plain JavaScript objects
- Use PostgreSQL connection pooling
- Remain database-focused

Repositories should not return HTTP responses.

---

# 11. Service Standards

Services own the application's business rules.

Examples

Transaction Service

- Duplicate Detection
- Payment Reconciliation
- Budget Updates
- Event Emission

Budget Service

- Threshold Evaluation
- Budget Calculation

Goal Service

- Progress Calculation
- Completion Detection

Services coordinate repositories.

---

# 12. Controller Standards

Controllers should only coordinate requests.

Good

```javascript
const transaction = await transactionService.create(
    req.user.id,
    req.body
);

return success(res, transaction);
```

Bad

```javascript
await pool.query(...);

sendEmail(...);

eventBus.emit(...);

res.json(...);
```

Controllers should never become business layers.

---

# 13. Anti Patterns

Never

```
Controller

↓

Repository
```

Never

```
Repository

↓

Repository
```

Never

```
Repository

↓

Service
```

Never

```
Controller

↓

Database
```

Never

```
Repository

↓

Event Bus
```

Never

```
Repository

↓

AI Provider
```

---

# 14. Examples

## Good

```
Create Transaction

↓

Transaction Controller

↓

Transaction Service

↓

Transaction Repository

↓

PostgreSQL

↓

Emit transaction.created
```

---

## Bad

```
Controller

↓

Database

↓

Dashboard

↓

Notifications

↓

AI
```

---

# 15. Testing

Each layer should be tested independently.

Routes

- Route registration

Middleware

- Authentication
- Authorization
- Validation

Controllers

- Request handling
- Response handling

Services

- Business rules
- Event emission

Repositories

- SQL
- CRUD
- Filtering
- Pagination

---

# 16. Definition of Done

The Repository Pattern is correctly implemented when

- Controllers remain thin.
- Services contain all business logic.
- Repositories contain only database logic.
- SQL exists only inside repositories.
- Events are emitted only by services.
- Transactions are managed only by services.
- Layers communicate only in the documented direction.
- No architectural boundaries are violated.

---

# References

- architecture.md
- backend_architecture.md
- service_boundaries.md
- events.md
- database.md

---

## Golden Rule

If you're unsure where code belongs:

| Responsibility | Layer |
|---------------|-------|
| HTTP | Controller |
| Business Logic | Service |
| SQL | Repository |
| Authentication | Middleware |
| Validation | Middleware + Service |
| Events | Service |

Never mix responsibilities across layers.