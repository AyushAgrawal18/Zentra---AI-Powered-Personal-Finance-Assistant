---
title: Event-Driven Architecture

module: architecture

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - architecture/service_boundaries.md
  - architecture/background_jobs.md
  - features/transactions.md
  - features/budgets.md
  - features/goals.md
---

# Event-Driven Architecture

> Zentra uses an internal event-driven architecture to decouple modules and improve scalability.

---

# Table of Contents

1. Overview
2. Why Event-Driven Architecture?
3. Event Bus
4. Event Naming Convention
5. Event Lifecycle
6. Domain Events
7. Event Consumers
8. Event Flow
9. Event Guidelines
10. LLM Rules

---

# 1. Overview

Every important business action inside Zentra emits an event.

Instead of directly calling another module,

Modules communicate through events.

Example

❌ Bad

```
Transaction

↓

Dashboard.update()

↓

Budget.update()

↓

Analytics.update()

↓

Notification.send()

↓

AI.generate()
```

Good

```
Transaction Created

↓

Emit Event

↓

transaction.created

↓

Dashboard

Budget

Analytics

Notifications

AI
```

---

# 2. Why Event-Driven Architecture?

Benefits

✅ Loose coupling

✅ Easy maintenance

✅ Easier testing

✅ Independent modules

✅ Background processing

✅ Better scalability

---

# 3. Event Bus

Version 1

Use

```
Node.js EventEmitter
```

Future

```
Redis Pub/Sub

Kafka

RabbitMQ

AWS EventBridge
```

Changing the implementation must not require changes to business logic.

---

# 4. Event Naming Convention

Always use

```
resource.action
```

Examples

```
transaction.created

transaction.updated

transaction.deleted

budget.created

goal.completed

notification.sent
```

Never

```
updateDashboard

sendNotification

refreshAnalytics
```

Events describe **what happened**, not **what should happen**.

---

# 5. Event Lifecycle

```
Controller

↓

Service

↓

Repository

↓

Commit Database

↓

Emit Event

↓

Listeners

↓

Background Jobs
```

Never emit an event before the database transaction has completed successfully.

---

# 6. Domain Events

## User Events

```
user.registered

user.email_verified

user.logged_in

user.logged_out

user.password_reset

user.deleted
```

---

## Transaction Events

```
transaction.created

transaction.updated

transaction.deleted

transaction.imported

transaction.reconciled

transaction.duplicate_detected
```

---

## Budget Events

```
budget.created

budget.updated

budget.deleted

budget.threshold.crossed

budget.exceeded
```

---

## Goal Events

```
goal.created

goal.updated

goal.completed

goal.deleted

goal.contribution_added
```

---

## Payment Events

```
payment.initiated

payment.completed

payment.failed

payment.cancelled
```

---

## CSV Events

```
csv.import.started

csv.import.completed

csv.import.failed
```

---

## SMS Events

```
sms.parsed

sms.confirmed

sms.failed
```

---

## AI Events

```
ai.chat.completed

ai.insight.generated

ai.summary.generated
```

---

## Notification Events

```
notification.sent

notification.failed
```

---

# 7. Event Consumers

## transaction.created

Consumed By

- Dashboard Module
- Budget Module
- Goal Module
- Analytics Module
- Notification Module
- AI Module

---

## transaction.updated

Consumed By

- Dashboard
- Budget
- Analytics
- Goals
- AI

---

## transaction.deleted

Consumed By

- Dashboard
- Budget
- Analytics
- Goals

---

## budget.threshold.crossed

Consumed By

- Notifications

- AI Insights

---

## goal.completed

Consumed By

- Notifications

- Dashboard

- Analytics

---

## payment.completed

Consumed By

- Transactions

- Dashboard

- Analytics

---

# 8. Example Event Flow

User creates transaction

```
POST /transactions

↓

Transaction Service

↓

Insert Database

↓

Commit

↓

Emit

transaction.created
```

Listeners

```
Dashboard Listener

↓

Refresh Summary

--------------------

Budget Listener

↓

Recalculate

--------------------

Analytics Listener

↓

Refresh Charts

--------------------

AI Listener

↓

Queue Insights

--------------------

Notification Listener

↓

Check Budget Alert
```

Each listener executes independently.

A failure in one listener must not prevent the others from running.

---

# 9. Event Processing Rules

Rules

1.

Events are immutable.

Never modify an emitted event.

---

2.

Events are emitted only after successful database commit.

---

3.

Listeners must be idempotent.

Running the same listener twice must not corrupt data.

---

4.

Events should contain only the data required by consumers.

Avoid sending entire database objects when only IDs are needed.

Example

Good

```json
{
    "transactionId":"uuid",
    "userId":"uuid"
}
```

Bad

Entire transaction record.

---

5.

Events must never expose sensitive data.

Never include

- Passwords

- JWT

- Refresh Tokens

- Secrets

---

6.

Long-running work must execute asynchronously.

Examples

- AI generation

- Notifications

- Analytics refresh

---

# 10. Event Failure Strategy

If a listener fails

```
Transaction Created

↓

Dashboard Success

↓

Budget Success

↓

Analytics Failed

↓

Retry Analytics
```

Failure of one listener must not rollback successful listeners.

Errors must be logged for retry.

---

# 11. Event Logging

Every emitted event should be logged.

Example

```
Event

transaction.created

Timestamp

2026-08-01 14:22

User

UUID

Status

Success
```

---

# 12. Folder Structure

```
src/

events/

eventBus.js

listeners/

transaction.listener.js

budget.listener.js

goal.listener.js

notification.listener.js

analytics.listener.js

ai.listener.js
```

Modules emit events.

Listeners subscribe.

---

# 13. LLM Rules

Mandatory

- Never directly call Dashboard from Transactions.
- Never directly call Budget from Transactions.
- Always emit events after successful commits.
- Keep listeners independent.
- Use descriptive event names.
- Avoid circular event chains.
- Never emit duplicate events for the same action.

---

# 14. Definition of Done

The event system is complete when:

- Event bus implemented.
- Event naming standardized.
- All domain events documented.
- Listeners implemented.
- Events emitted after commits.
- Logging enabled.
- Error handling implemented.
- Documentation updated.

---

# References

- docs/architecture/service_boundaries.md
- docs/architecture/background_jobs.md
- docs/features/transactions.md
- docs/features/budgets.md
- docs/features/goals.md