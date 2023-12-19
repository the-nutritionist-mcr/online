---
id: is-the-plan-open-or-closed
title: Is the plan open or closed?
tags:
  - Plan
  - Open or Closed
  - Choose Meals Disabled
  - Choose Meals Enabled

description: How the application decides if the plan is open or closed
---

# Is the plan open or closed?

The logic that governs whether a plan is open or closed for customers is governed using the following flow

```mermaid
flowchart TD
    A{{"`Has **_midnight_** on the **_first Wednesday_** after the **_most recent plan was created_** passed?`"}} -->|Yes| B(["`The plan is **closed**`"])
    A -->|No| C{{"`Has the **_publish button been pressed_** on that plan?`"}}
    C -->|No| B
    C -->|Yes| D{{"`Are **_all subscriptions for the customer_** going to be active for **_both cooks_**?`"}}
    D -->|No| B
    D -->|Yes| E(["`The plan is **open**`"])
```

this will impact the following parts of the application

- Whether the [make choices button](../Pages/account.md#choose-meals-button) is enabled or disabled on the account page
- Whether the [choose meals page](../Pages/choose-meals.md) is accessible