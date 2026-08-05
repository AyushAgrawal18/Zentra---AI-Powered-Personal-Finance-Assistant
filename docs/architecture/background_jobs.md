---
title: Background Jobs Architecture

module: architecture

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - architecture/events.md
  - architecture/service_boundaries.md
  - deployment/monitoring.md
---

# Background Jobs

> This document defines every asynchronous task executed by Zentra.

---

# Table of Contents

1. Overview
2. Why Background Jobs?
3. Job Lifecycle
4. Job Categories
5. Job Queue
6. Retry Strategy
7. Failure Handling
8. Monitoring
9. Job Ownership
10. LLM Rules

---

# 1. Overview

Not every task should execute during an HTTP request.

Example

User creates transaction.

The user should receive

```
201 Created
```

immediately.

Everything else should execute later.

---

# 2. Why Background Jobs?

Bad

```
Create Transaction

↓

Save Database

↓

Update Dashboard

↓

Update Analytics

↓

Generate AI

↓

Send Notification

↓

Return Response
```

User waits.

Good

```
Create Transaction

↓

Save Database

↓

Return Response

↓

Background Jobs

Dashboard

Analytics

Notifications

AI
```

Much faster.

---

# 3. Job Lifecycle

```
Event

↓

Job Created

↓

Queue

↓

Worker

↓

Execute

↓

Completed

↓

Log
```

---

# 4. Job Categories

## Dashboard Jobs

- Refresh dashboard summary
- Refresh spending cards
- Refresh charts

---

## Analytics Jobs

- Monthly analytics
- Spending trends
- Category summaries
- Merchant summaries

---

## AI Jobs

- Financial summary
- Weekly insights
- Budget recommendations
- Spending anomalies

---

## Notification Jobs

- Budget alerts
- Goal reminders
- Goal completed
- Payment reminders

---

## CSV Jobs

- Parse CSV
- Validate records
- Detect duplicates

---

## SMS Jobs

- Parse SMS
- Extract merchant
- Extract amount

---

## Payment Jobs

- Verify payment status
- Reconcile payment

---

# 5. Queue Strategy

Version 1

```
Node.js EventEmitter
```

Version 2

```
BullMQ + Redis
```

Version 3

```
Distributed Workers
```

Business logic must never depend on the queue implementation.

---

# 6. Retry Strategy

Retryable Jobs

- AI
- Notifications
- Analytics

Retries

```
3
```

Delay

```
30 seconds

2 minutes

5 minutes
```

After maximum retries

↓

Dead Letter Queue (future)

---

# 7. Failure Handling

Example

```
Transaction Created

↓

Dashboard Success

↓

Analytics Failed

↓

Retry

↓

Success
```

Analytics failure must never rollback the transaction.

---

# 8. Monitoring

Track

- Pending Jobs
- Running Jobs
- Failed Jobs
- Retry Count
- Average Execution Time

---

# 9. Job Ownership

| Job | Owner |
|------|-------|
| Dashboard Refresh | Dashboard |
| Analytics | Analytics |
| AI Summary | AI |
| Budget Alert | Notifications |
| Goal Reminder | Notifications |
| CSV Parsing | CSV |
| SMS Parsing | SMS |

Each module owns its own jobs.

---

# 10. LLM Rules

Mandatory

- Never block API responses with long-running work.
- Emit events instead of calling modules directly.
- Make jobs idempotent.
- Log failures.
- Retry transient failures only.
- Keep business logic inside the owning module.

---

# Definition of Done

- Queue architecture documented.
- Retry strategy defined.
- Monitoring defined.
- Failure handling documented.
- Ownership documented.

---

> Architecture Rule #2
>
> **If a task is not required to return the HTTP response, it should execute asynchronously.**