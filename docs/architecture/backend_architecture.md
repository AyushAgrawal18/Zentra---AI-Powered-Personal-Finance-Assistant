---
title: Backend Architecture

module: architecture

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - architecture.md
  - service_boundaries.md
  - repository_pattern.md
  - events.md
  - database.md
---

# Backend Architecture

> This document defines the architecture of the Zentra backend, including request lifecycle, feature organization, service boundaries, repositories, and internal communication.

---

# Table of Contents

1. Purpose
2. Architectural Goals
3. Non Goals
4. Backend Overview
5. Technology Stack
6. Folder Structure
7. Feature-Based Architecture
8. Request Lifecycle
9. Layer Responsibilities
10. Shared Modules
11. Service Communication
12. Event-Driven Architecture
13. Repository Pattern
14. Error Handling
15. Security
16. Performance
17. Scalability
18. Design Principles
19. Locked Decisions
20. Future Evolution

---

# 1. Purpose

This document defines how the Zentra backend is structured.

It establishes:

- Module boundaries
- Request lifecycle
- Business logic ownership
- Database interaction
- Event communication
- Shared services

Every backend feature must follow the architecture defined here.

---

# 2. Architectural Goals

The backend architecture should provide:

- Feature isolation
- High maintainability
- Reusable business logic
- Thin controllers
- Scalable modules
- Consistent APIs
- Secure authentication
- Reliable event processing
- Testable services

---

# 3. Non Goals

Version 1 intentionally does **not** include:

- Microservices
- GraphQL
- CQRS
- Event Sourcing
- gRPC
- Distributed Transactions
- Multi-tenancy

These may be considered in future versions.

---

# 4. Backend Overview

The backend is implemented as a modular REST API using Node.js and Express.

Each feature owns its complete implementation including:

- Routes
- Controllers
- Services
- Repositories
- Validation
- Events
- Constants
- Tests

Features communicate through public services and domain events.

---

# 5. Technology Stack

Framework

- Node.js
- Express.js

Database

- PostgreSQL

Authentication

- JWT
- Refresh Tokens

Caching

- Redis

Validation

- Zod

Testing

- Jest
- Supertest

Deployment

- Docker

---

# 6. Folder Structure

```
src/

├── modules/
├── shared/
├── config/
├── database/
├── middleware/
├── providers/
├── routes/
├── utils/
├── jobs/
└── app.js
```

Every business feature resides inside the `modules/` directory.

---

# 7. Feature-Based Architecture

Each feature follows the same structure.

```
transactions/

├── controllers/
├── services/
├── repositories/
├── routes/
├── validations/
├── events/
├── constants/
├── utils/
└── tests/
```

Advantages:

- Modular
- Scalable
- Easy testing
- Independent development

---

# 8. Request Lifecycle

Every request follows this flow.

```
HTTP Request

↓

Route

↓

Middleware

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

PostgreSQL

↓

Service

↓

Controller

↓

HTTP Response
```

No layer should be skipped.

---

# 9. Layer Responsibilities

## Routes

Responsible for:

- Endpoint registration
- Middleware assignment
- API versioning

Never:

- Execute business logic

---

## Middleware

Responsible for:

- Authentication
- Authorization
- Validation
- Rate limiting
- Logging

Never:

- Access repositories

---

## Controllers

Responsible for:

- Parsing requests
- Calling services
- Returning responses

Never:

- Execute SQL
- Contain business rules

---

## Services

Responsible for:

- Business logic
- Transactions
- Event emission
- Repository coordination

Never:

- Return HTTP responses
- Write SQL

---

## Repositories

Responsible for:

- SQL queries
- CRUD operations
- Pagination
- Filtering

Never:

- Validate business rules
- Emit events

---

# 10. Shared Modules

Shared modules include:

- Authentication
- Logger
- Error Handler
- Event Bus
- Cache
- Email
- Storage
- AI Provider
- Utilities

Shared modules should remain generic and feature-independent.

---

# 11. Service Communication

Features communicate through:

- Public service methods
- Domain events

Direct repository access across features is prohibited.

Example:

```
Transaction Service

↓

Budget Service

✓
```

```
Transaction Repository

↓

Budget Repository

✗
```

---

# 12. Event-Driven Architecture

Business events are emitted only after successful database commits.

Examples:

- transaction.created
- budget.updated
- goal.completed
- payment.reconciled

Subscribers may include:

- Dashboard
- Analytics
- Notifications
- AI Insights

Events should remain asynchronous whenever possible.

---

# 13. Repository Pattern

Repositories isolate database access from business logic.

Rules:

- SQL exists only inside repositories.
- Services never execute SQL.
- Controllers never access repositories directly.
- Parameterized queries are mandatory.

See:

`repository_pattern.md`

---

# 14. Error Handling

The backend uses centralized error handling.

Every error should include:

- Error Code
- Message
- HTTP Status
- Timestamp
- Request ID (if available)

Sensitive implementation details must never be exposed.

---

# 15. Security

The backend enforces:

- JWT Authentication
- Role-based Authorization
- Input Validation
- SQL Injection Prevention
- XSS Protection
- Rate Limiting
- CORS
- Helmet
- Secure Password Hashing

Security is applied consistently across all modules.

---

# 16. Performance

Performance strategies include:

- PostgreSQL indexes
- Connection pooling
- Redis caching
- Pagination
- Lazy loading
- Parallel queries where appropriate

Long-running tasks should execute in background jobs.

---

# 17. Scalability

The architecture supports:

- Horizontal scaling
- Background workers
- Distributed caching
- AI provider replacement
- Future microservices
- Event bus replacement

No feature should assume a single server deployment.

---

# 18. Design Principles

- Feature-first architecture
- Repository Pattern
- Thin Controllers
- Rich Services
- Event-driven communication
- Separation of concerns
- Reusable shared modules
- API-first development

---

# 19. Locked Decisions

Version 1 architecture decisions:

- Node.js + Express
- PostgreSQL
- REST APIs
- JWT Authentication
- Repository Pattern
- EventEmitter
- Redis
- Feature-based architecture
- JavaScript only (No TypeScript)

Changes require an Architecture Decision Record (ADR).

---

# 20. Future Evolution

Future improvements may include:

- Background job queues
- Message brokers
- CQRS
- Microservices
- Distributed event bus
- Read replicas
- AI workflow orchestration

The current architecture is intentionally designed to support these enhancements without major refactoring.

---

# References

- architecture.md
- repository_pattern.md
- service_boundaries.md
- events.md
- database.md

---

> **Architecture Principle:** Every backend module should own its business logic, expose well-defined services, and communicate through stable interfaces. The backend must remain modular, testable, and scalable while keeping responsibilities clearly separated.