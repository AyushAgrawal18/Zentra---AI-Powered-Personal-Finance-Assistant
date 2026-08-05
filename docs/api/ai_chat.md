---
title: AI Chat API

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: AI Team

related_docs:
  - api_overview.md
  - authentication.md
  - errors.md
  - rate_limiting.md
  - ai_insights.md
  - ../ai/ai_architecture.md
---

# AI Chat API

> This document defines every endpoint related to Zentra's AI Financial Assistant, including chat sessions, conversation history, message exchange, context management, and AI-generated financial guidance.

---

# Table of Contents

1. Purpose
2. Authentication
3. AI Chat Capabilities
4. Chat Flow
5. Endpoints
6. Chat Session Model
7. Create Chat Session
8. Send Message
9. Conversation History
10. Delete Conversation
11. AI Context
12. Validation Rules
13. Response Examples
14. Error Responses
15. Business Rules
16. Security & Privacy
17. Design Principles

---

# 1. Purpose

The AI Chat API enables users to interact with Zentra's AI Financial Assistant.

Version 1 supports:

- Financial questions
- Spending analysis
- Budget guidance
- Savings recommendations
- Transaction explanations
- Goal recommendations

The AI Assistant never performs financial operations directly.

---

# 2. Authentication

All AI endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users may access only their own conversations.

---

# 3. AI Chat Capabilities

Supported topics:

- Spending Analysis
- Budget Advice
- Savings Suggestions
- Goal Planning
- Transaction Questions
- Category Explanations
- Financial Trends
- General Financial Education

Unsupported actions:

- Executing payments
- Editing transactions
- Creating budgets automatically
- Deleting financial records
- Accessing another user's data

---

# 4. Chat Flow

```
Create Session

↓

Send User Message

↓

Build Financial Context

↓

Generate AI Response

↓

Store Conversation

↓

Return Response
```

---

# 5. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /ai/chat/sessions | Create chat session |
| GET | /ai/chat/sessions | List sessions |
| GET | /ai/chat/sessions/{id} | Get conversation |
| POST | /ai/chat/sessions/{id}/messages | Send message |
| DELETE | /ai/chat/sessions/{id} | Delete conversation |

---

# 6. Chat Session Model

A chat session contains:

- Session ID
- Title
- Messages
- Created At
- Updated At
- Last Activity

Each message contains:

- Role
- Content
- Timestamp

Roles:

- USER
- ASSISTANT
- SYSTEM

---

# 7. Create Chat Session

## Endpoint

```http
POST /api/v1/ai/chat/sessions
```

Example Response

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "title": "Budget Planning"
  }
}
```

---

# 8. Send Message

## Endpoint

```http
POST /api/v1/ai/chat/sessions/{id}/messages
```

Request

```json
{
  "message": "How can I reduce my monthly food expenses?"
}
```

Response

```json
{
  "success": true,
  "data": {
    "messageId": "uuid",
    "role": "ASSISTANT",
    "content": "You spent ₹12,500 on food last month. Consider setting a monthly budget of ₹10,000 and reducing restaurant spending."
  }
}
```

---

# 9. Conversation History

## Endpoint

```http
GET /api/v1/ai/chat/sessions/{id}
```

Returns:

- Session information
- Message history
- Creation time
- Last activity

Messages are returned in chronological order.

---

# 10. Delete Conversation

## Endpoint

```http
DELETE /api/v1/ai/chat/sessions/{id}
```

Deletes the conversation history for the authenticated user.

Deletion does not affect financial records.

---

# 11. AI Context

The AI may use:

- Transactions
- Budgets
- Goals
- Categories
- Analytics
- User Preferences

The AI never accesses another user's data.

Context is generated dynamically for each request.

---

# 12. Validation Rules

Validation includes:

- Message cannot be empty.
- Message length must not exceed configured limits.
- Session must exist.
- Session must belong to the authenticated user.
- AI requests are subject to rate limits.

Validation failures return HTTP 422.

---

# 13. Response Examples

Conversation

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "messages": []
  }
}
```

Session List

```json
{
  "success": true,
  "data": []
}
```

---

# 14. Error Responses

| HTTP | Error Code |
|------|------------|
| 400 | BAD_REQUEST |
| 401 | UNAUTHORIZED |
| 403 | FORBIDDEN |
| 404 | CHAT_SESSION_NOT_FOUND |
| 429 | RATE_LIMIT_EXCEEDED |
| 422 | VALIDATION_ERROR |
| 500 | AI_SERVICE_ERROR |

Responses follow `errors.md`.

---

# 15. Business Rules

- Users may access only their own conversations.
- AI responses are generated dynamically.
- Conversation history is persisted.
- Financial data is read-only.
- AI responses must not modify user data.
- AI conversations are isolated per user.

---

# 16. Security & Privacy

- JWT authentication required.
- Conversations are private.
- Prompts are logged securely.
- Personally identifiable information is protected.
- AI providers receive only the minimum required context.
- Sensitive credentials are never included in prompts.

---

# 17. Design Principles

- Context-aware responses
- Read-only financial access
- Secure conversation storage
- Provider abstraction
- Consistent response format
- Strong validation
- User ownership enforcement

---

# References

- api_overview.md
- authentication.md
- errors.md
- rate_limiting.md
- ai_insights.md
- ../ai/ai_architecture.md

---

> **API Principle:** The AI Chat API provides personalized financial assistance by combining conversational AI with the user's financial context. Every interaction must remain secure, private, read-only, and transparent while delivering helpful, explainable financial guidance.