# Feature Specification: Dashboard Widgets
# 📦 Dashboard Widgets Specification

> **Project:** Zentra
>
> **Version:** 1.0.0
>
> **Feature ID:** F-002.1
>
> **Status:** Planned
>
> **Priority:** P0
>
> **Owner:** Frontend & Backend Team

---

# Table of Contents

1. Purpose
2. Widget Architecture
3. Widget List
4. Widget Specifications
5. Refresh Strategy
6. Loading States
7. Empty States
8. Error States
9. Responsive Behaviour
10. Performance
11. Accessibility
12. Acceptance Criteria
13. LLM Notes

---

# 1. Purpose

This document defines every widget displayed on the Zentra dashboard.

Each widget is an independent UI component responsible for presenting a specific type of financial information.

Widgets should remain modular so they can be reused across both the web and mobile applications.

---

# 2. Widget Architecture

Every widget should follow the same lifecycle.

```
Request Data
      │
      ▼
Loading
      │
      ▼
Success
      │
      ├────► Empty
      │
      └────► Error
```

Each widget manages its own loading and error state.

A failure in one widget must never prevent other widgets from loading.

---

# 3. Widget List

Version 1 dashboard includes:

| Widget | Priority |
|----------|----------|
| Financial Summary | P0 |
| Quick Actions | P0 |
| Recent Transactions | P0 |
| Budget Progress | P0 |
| Goal Progress | P0 |
| Spending Chart | P0 |
| Income vs Expense | P0 |
| AI Insights | P0 |

---

# 4. Widget Specifications

---

## Financial Summary

### Purpose

Provide a quick overview of the user's financial position.

### Displays

- Total Balance
- Monthly Income
- Monthly Expenses
- Net Savings

### Actions

- Open Analytics

### Data Source

Transactions

Budgets

Goals

---

## Quick Actions

### Purpose

Provide shortcuts for frequently used actions.

### Buttons

- Add Transaction
- Import CSV
- Review SMS Suggestions
- Create Budget
- Create Goal
- Pay via UPI

### Data Source

None

---

## Recent Transactions

### Purpose

Display the latest financial activity.

### Displays

- Latest 10 Transactions
- Category
- Merchant
- Amount
- Date

### Actions

- View Transaction
- View All

### Data Source

Transactions

---

## Budget Progress

### Purpose

Display current budget utilization.

### Displays

- Budget Name
- Budget Limit
- Amount Used
- Remaining Amount
- Progress Percentage

### Actions

- View Budgets
- Create Budget

### Data Source

Budgets

Transactions

---

## Goal Progress

### Purpose

Track savings goals.

### Displays

- Goal Name
- Target Amount
- Saved Amount
- Remaining Amount
- Completion Percentage

### Actions

- View Goals
- Add Contribution

### Data Source

Goals

---

## Spending Chart

### Purpose

Visualize monthly spending.

### Displays

- Spending by Month

### Default Range

Current Month

### Data Source

Transactions

---

## Income vs Expense

### Purpose

Compare monthly income and expenses.

### Displays

- Income
- Expenses

### Chart

Bar Chart

### Data Source

Transactions

---

## AI Insights

### Purpose

Provide personalized financial recommendations.

### Displays

- Budget Alerts
- Saving Suggestions
- Spending Warnings
- Financial Tips

### Actions

- Open AI Chat

### Data Source

AI Insights

Transactions

Budgets

---

# 5. Refresh Strategy

Widgets refresh automatically:

- After creating a transaction
- After editing a transaction
- After deleting a transaction
- After importing CSV
- After approving SMS suggestions
- After creating budgets
- After updating goals

Manual refresh should also be available.

---

# 6. Loading States

Each widget should display:

- Skeleton Loader
- Placeholder Charts
- Disabled Buttons (where applicable)

The dashboard should never appear blank while loading.

---

# 7. Empty States

When no data exists:

Financial Summary

```
No financial data available.
```

Recent Transactions

```
No transactions found.
```

Budget Progress

```
Create your first budget.
```

Goal Progress

```
Start saving by creating a goal.
```

Charts

```
No data available.
```

AI Insights

```
Insights will appear once sufficient financial data is available.
```

---

# 8. Error States

If a widget fails:

- Show an error message.
- Display a Retry button.
- Do not affect other widgets.
- Log the error for debugging.

---

# 9. Responsive Behaviour

Desktop

- Multi-column layout

Tablet

- Two-column layout

Mobile

- Single-column layout

Widgets should resize gracefully without horizontal scrolling.

---

# 10. Performance

Requirements:

- Initial dashboard load ≤ 2 seconds.
- Independent widget rendering.
- Parallel API requests where possible.
- Avoid unnecessary re-fetching.

---

# 11. Accessibility

Widgets should:

- Support keyboard navigation.
- Include descriptive headings.
- Maintain sufficient color contrast.
- Provide accessible labels for interactive elements.

---

# 12. Acceptance Criteria

The dashboard widgets are complete when:

- All widgets display correct data.
- Independent loading states work.
- Empty states are handled.
- Error states are handled.
- Responsive layouts verified.
- Performance targets achieved.

---

# 13. LLM Notes

When implementing dashboard widgets:

- Keep every widget independent.
- Never duplicate business logic.
- Use reusable UI components.
- Fetch only the data required by the widget.
- Avoid unnecessary API calls.
- Support responsive layouts by default.
- Widgets should be reusable across Web and Flutter.

---

# References

- dashboard.md
- analytics.md
- transactions.md
- budgets.md
- goals.md
- ai-insights.md

---

> **Implementation Principle:** Every dashboard widget is an independent, reusable component responsible for displaying one specific piece of financial information. Widgets should remain loosely coupled, performant, and resilient to failures.