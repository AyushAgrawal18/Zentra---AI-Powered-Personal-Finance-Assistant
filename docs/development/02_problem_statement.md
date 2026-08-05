# 📌 Problem Statement

> **Project:** Zentra  
> **Version:** 1.0.0  
> **Status:** Planning  
> **Document Type:** Product Requirements Document (PRD)

---

# Table of Contents

1. Executive Summary
2. Background
3. Problem Statement
4. Current Market Challenges
5. Existing Solutions & Gaps
6. User Pain Points
7. Business Opportunity
8. Proposed Solution
9. Product Goals
10. Product Scope
11. Out of Scope
12. Success Criteria
13. Risks & Challenges
14. Assumptions
15. Conclusion

---

# 1. Executive Summary

Managing personal finances has become increasingly difficult despite the rapid growth of digital payment systems.

Modern users interact with multiple financial platforms every day:

- UPI Applications
- Bank Applications
- Credit Cards
- Debit Cards
- Cash
- Wallets
- Online Shopping Platforms

Although making payments has become simple, **understanding financial behaviour has become significantly more difficult.**

Most existing finance applications focus on recording transactions instead of helping users make better financial decisions.

Zentra addresses this gap by becoming an **AI-powered Financial Operating System** that combines transaction management, budgeting, intelligent financial insights, payment initiation, and financial planning into a unified platform.

---

# 2. Background

The digital payments ecosystem has grown rapidly over the last decade.

Users today frequently:

- Pay through UPI
- Receive bank transaction SMS
- Download monthly bank statements
- Make cash purchases
- Maintain multiple bank accounts
- Use multiple payment applications

Financial data therefore becomes scattered across several independent platforms.

As a result:

- users lose visibility,
- budgeting becomes difficult,
- expense tracking becomes inconsistent,
- financial planning becomes reactive rather than proactive.

---

# 3. Problem Statement

The core problem is **not the lack of financial data**.

The problem is the **lack of financial intelligence.**

Users already possess enough financial information through:

- SMS
- Bank statements
- Payment history
- Wallet transactions
- Manual records

However, this information is:

- fragmented,
- difficult to analyse,
- disconnected,
- and largely unused for decision making.

Users need a system that transforms financial records into meaningful insights and actionable recommendations.

---

# 4. Current Market Challenges

## 4.1 Fragmented Financial Data

Financial information originates from multiple independent systems.

Examples include:

- UPI
- Bank Statements
- Cash
- Wallets
- Credit Cards
- Debit Cards

No single platform provides a unified financial history.

---

## 4.2 Manual Expense Tracking

Most expense tracking applications rely heavily on manual data entry.

Manual tracking fails because:

- users forget,
- users become busy,
- users lose motivation,
- transactions accumulate rapidly.

Incomplete data reduces the usefulness of financial reports.

---

## 4.3 Poor Financial Visibility

Most users cannot answer questions such as:

- Where did I spend the most this month?
- How much did food cost me?
- Which subscriptions am I paying for?
- Why are my expenses increasing?

Traditional applications display charts but rarely explain the underlying behaviour.

---

## 4.4 Static Budgeting

Existing budgeting tools allow users to define spending limits.

However they rarely provide intelligent guidance.

Examples:

- Budget exceeded by ₹3,000

Instead of

> Food spending increased by 22% compared to last month. Reducing restaurant expenses by ₹2,000 would bring your monthly budget back on track.

---

## 4.5 Lack of Intelligent Assistance

Modern AI has transformed many domains.

Personal finance applications still expect users to manually analyse reports.

Users should instead be able to ask:

- Can I afford this purchase?
- Why did my spending increase?
- What should I improve this month?
- How much can I safely save?

---

## 4.6 Payment Workflow Fragmentation

Current workflow:

```
Expense Tracker

↓

Open UPI App

↓

Complete Payment

↓

Return Later

↓

Manually Update Records
```

This disconnect leads to incomplete transaction histories and additional manual effort.

---

# 5. Existing Solutions & Gaps

| Existing Solution | Limitation |
|------------------|------------|
| Expense Tracker | Manual entry |
| Banking Apps | Limited to one bank |
| UPI Apps | Payment only |
| Spreadsheet | Time consuming |
| Budget Apps | Static budgeting |
| AI Chatbots | No financial context |

No single solution combines:

- financial tracking,
- budgeting,
- AI,
- analytics,
- payment initiation,
- transaction reconciliation.

---

# 6. User Pain Points

Users commonly experience:

- Forgetting cash expenses.
- Losing transaction history.
- Overspending unknowingly.
- Difficulty managing budgets.
- Poor savings discipline.
- Lack of financial insights.
- Difficulty comparing monthly spending.
- No centralized financial dashboard.

---

# 7. Business Opportunity

There is an opportunity to build a unified financial platform that:

- aggregates financial data,
- simplifies budgeting,
- provides intelligent recommendations,
- improves financial awareness,
- reduces manual effort.

Rather than replacing existing banking applications, Zentra complements them by acting as an intelligent financial layer.

---

# 8. Proposed Solution

Zentra addresses these challenges through six core pillars.

## 1. Unified Transaction Management

Collect transactions from:

- Manual Entry
- CSV Bank Statements
- SMS Suggestions

Normalize all data into a single transaction history.

---

## 2. Intelligent Budgeting

Provide:

- Monthly Budgets
- Category Budgets
- Budget Alerts
- Budget Recommendations

---

## 3. Savings Goals

Allow users to:

- create savings goals,
- monitor progress,
- receive AI recommendations.

---

## 4. AI Financial Copilot

Users can ask:

> Where did I spend the most?

> Can I afford a ₹50,000 laptop?

> Predict next month's expenses.

> Suggest ways to save ₹5,000.

---

## 5. Financial Analytics

Generate:

- Spending Trends
- Category Reports
- Cash Flow
- Income vs Expenses
- Budget Performance

---

## 6. Payment Initiation

Zentra supports:

- UPI Deep Link Generation
- Payment Intent Tracking
- Transaction Reconciliation

**Important**

Zentra **does not process payments**.

Payments are securely completed inside the user's preferred UPI application (Google Pay, PhonePe, BHIM, etc.), while Zentra tracks the payment intent and reconciles it with the user's financial records.

---

# 9. Product Goals

The primary goals are:

- Reduce manual expense tracking.
- Centralize financial information.
- Improve financial awareness.
- Encourage healthier spending habits.
- Simplify budgeting.
- Provide meaningful AI assistance.
- Build a scalable financial platform.

---

# 10. Product Scope

## Included in Version 1

- Authentication
- Dashboard
- Transactions
- Categories
- Budgets
- Goals
- CSV Import
- SMS Suggestions
- AI Chat
- AI Insights
- Analytics
- Notifications
- Profile
- Settings
- UPI Deep Link Payment Initiation
- Payment Intent Tracking
- Transaction Reconciliation

---

## Future Scope

- Investment Portfolio
- Net Worth Dashboard
- Subscription Detection
- OCR Receipt Scanner
- Family Accounts
- Shared Budgets
- Credit Score
- Account Aggregator
- Banking Integrations (subject to supported APIs)

---

# 11. Out of Scope

The following are intentionally excluded from Version 1:

- Native UPI Processing
- Bank Account Management
- NPCI Integration
- Money Transfer Processing
- Payment Gateway Services
- Loan Management
- Tax Filing

---

# 12. Success Criteria

The project will be successful if:

- Users can manage finances from a unified platform.
- AI provides useful financial recommendations.
- Multiple transaction sources are supported.
- Budget planning becomes easier.
- Payment initiation integrates seamlessly with existing UPI applications.
- The application demonstrates production-quality engineering.

---

# 13. Risks & Challenges

Potential risks include:

- SMS parsing inconsistencies across banks.
- Different CSV formats from financial institutions.
- Changes in UPI deep link behavior across applications.
- AI hallucinations or incorrect financial advice.
- Maintaining data consistency during reconciliation.

Mitigation strategies for these risks will be documented in the architecture and implementation guides.

---

# 14. Assumptions

The project assumes:

- Users have at least one supported UPI application installed.
- Users are willing to import bank statements or enable SMS-based suggestions.
- Internet connectivity is available for AI features.
- Future integrations may evolve as APIs and regulations change.

---

# 15. Conclusion

Personal finance should not stop at recording transactions.

Users need a platform that helps them understand their financial behaviour, plan for the future, and make informed decisions.

Zentra transforms fragmented financial data into actionable intelligence by combining transaction management, budgeting, analytics, AI-powered assistance, and seamless payment initiation within a single, modern financial platform.

---

> **"Track your money. Understand your habits. Build your future."**