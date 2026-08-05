# 🏛️ Zentra System Architecture

> **Project:** Zentra
>
> **Version:** 1.0.0
>
> **Status:** Locked
>
> **Document Type:** System Architecture
>
> **Owner:** Architecture Team

---

# Table of Contents

1. Purpose
2. Architecture Principles
3. High-Level Architecture
4. System Components
5. Application Layers
6. Feature Modules
7. Data Flow
8. Event Flow
9. External Integrations
10. Cross-Cutting Concerns
11. Scalability Strategy
12. Technology Stack
13. Architectural Constraints
14. Future Architecture
15. References

---

# 1. Purpose

This document defines the overall architecture of Zentra.

It explains how every major component communicates, where responsibilities belong, and how the system is organized to remain scalable, maintainable, and production-ready.

This is the highest-level architecture document in the project.

---

# 2. Architecture Principles

Zentra is designed around the following principles:

- Feature-first architecture
- Separation of concerns
- Modular development
- Event-driven communication
- Stateless backend
- API-first design
- Security by default
- Documentation-first development
- Reusable components
- Provider abstraction

Every architectural decision should support these principles.

---

# 3. High-Level Architecture

```
                    +----------------------+
                    |    Web (Next.js)     |
                    +----------------------+
                              │
                              │
                    +----------------------+
                    | Flutter Mobile App   |
                    +----------------------+
                              │
                              ▼
                  +--------------------------+
                  |     REST API Gateway      |
                  |     Node.js + Express     |
                  +--------------------------+
                              │
      ┌───────────────────────┼────────────────────────┐
      │                       │                        │
      ▼                       ▼                        ▼
+-------------+      +----------------+      +----------------+
| Feature     |      | Shared Services|      | Event Bus      |
| Modules     |      |                |      |                |
+-------------+      +----------------+      +----------------+
      │                       │                        │
      └───────────────┬───────────────┬────────────────┘
                      ▼
             +----------------------+
             | PostgreSQL Database  |
             +----------------------+
                      │
                      ▼
            External Integrations
```

---

# 4. System Components

The system consists of five major components.

## Client Applications

- Next.js Web Application
- Flutter Mobile Application

---

## Backend API

Responsible for:

- Authentication
- Business Logic
- Validation
- Event Handling
- AI Integration
- Payment Initiation

---

## Database

PostgreSQL stores:

- Users
- Transactions
- Categories
- Budgets
- Goals
- Payment Intents
- AI Insights
- Notifications
- Settings

---

## AI Layer

Responsible for:

- AI Chat
- AI Insights
- Financial Recommendations

The AI provider is abstracted so providers can be replaced without affecting application logic.

---

## External Services

Examples:

- Gemini / OpenAI
- Email Service
- Storage Provider
- UPI Applications

---

# 5. Application Layers

Every request follows this architecture.

```
Client

↓

Routes

↓

Middleware

↓

Controllers

↓

Services

↓

Repositories

↓

PostgreSQL
```

Responsibilities

| Layer | Responsibility |
|---------|---------------|
| Routes | API Registration |
| Middleware | Authentication, Authorization, Validation |
| Controllers | HTTP Request & Response |
| Services | Business Logic |
| Repositories | Database Access |
| Database | Persistent Storage |

Business logic must exist only inside Services.

---

# 6. Feature Modules

Each feature owns its own implementation.

Example:

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

Core modules include:

- Authentication
- Dashboard
- Transactions
- Categories
- Budgets
- Goals
- Payments
- CSV Import
- SMS Suggestions
- Analytics
- AI Chat
- AI Insights
- Notifications
- Reports
- Search
- Profile
- Settings

---

# 7. Data Flow

```
Client Request

↓

Authentication

↓

Validation

↓

Business Logic

↓

Database

↓

Response

↓

UI Update
```

Every request must pass through the complete application pipeline.

---

# 8. Event Flow

Modules communicate using domain events instead of direct dependencies wherever possible.

Example:

```
Transaction Created

↓

Event Published

↓

Budget Updated

↓

Dashboard Refreshed

↓

Analytics Recalculated

↓

AI Insights Regenerated

↓

Notification Created
```

Benefits:

- Loose coupling
- Easier maintenance
- Better scalability
- Independent feature evolution

---

# 9. External Integrations

Version 1 integrations:

- AI Provider
- Email Provider
- Object Storage
- UPI Deep Links

Future integrations:

- Bank APIs
- Push Notification Service
- OCR Service
- Investment APIs

External integrations should always be wrapped inside provider abstractions.

---

# 10. Cross-Cutting Concerns

The following concerns apply across all modules:

- Authentication
- Authorization
- Validation
- Logging
- Error Handling
- Rate Limiting
- Auditing
- Monitoring
- Configuration Management

These concerns should never be duplicated inside individual features.

---

# 11. Scalability Strategy

The architecture supports future scaling by:

- Feature isolation
- Stateless backend services
- Connection pooling
- Modular repositories
- Event-driven communication
- Horizontal application scaling
- Background job processing (future)
- Redis caching (future)

---

# 12. Technology Stack

| Layer | Technology |
|---------|------------|
| Frontend | Next.js |
| Mobile | Flutter |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Authentication | JWT + Refresh Tokens |
| AI | Provider Abstraction |
| Storage | S3-Compatible Storage |
| Deployment | Docker |
| Reverse Proxy | Nginx |
| Cloud | AWS |

---

# 13. Architectural Constraints

The following rules are mandatory:

- Business logic belongs only in Services.
- SQL belongs only in Repositories.
- Controllers remain thin.
- Routes only register endpoints.
- Feature modules remain independent.
- Shared code belongs in shared modules.
- No circular dependencies.
- Every feature must be documented before implementation.

Violation of these rules requires an Architecture Decision Record (ADR).

---

# 14. Future Architecture

Future architectural improvements may include:

- Microservices
- CQRS
- Event Streaming
- Background Workers
- Distributed Caching
- Read Replicas
- Search Engine Integration
- Open Banking Platform

These enhancements should preserve backward compatibility whenever possible.

---

# 15. References

- backend_architecture.md
- frontend_architecture.md
- ai_architecture.md
- deployment_architecture.md
- docs/development/09_project_decisions.md
- docs/database/database.md

---

# Architecture Summary

```
                 Clients
         ┌─────────┴─────────┐
         │                   │
   Next.js Web         Flutter Mobile
         │                   │
         └─────────┬─────────┘
                   ▼
          Node.js + Express API
                   │
     ┌─────────────┼─────────────┐
     │             │             │
 Feature      Shared Services   Events
 Modules
     │
     ▼
 PostgreSQL Database
     │
     ▼
 External Services
```

---

> **Architecture Principle:** Zentra is built as a modular, feature-driven platform where every component has a single responsibility, communicates through well-defined interfaces, and can evolve independently without compromising the integrity of the overall system.