---
id: choose-meals
title: Choose Meals
tags:
  - Choose Meals
  - Meal Choices
  - Customer facing

description: Allows customers to view and change meal quantities for the upcoming cook
---

# Choose Meals

:::warning
This page is **customer facing** - should you spot any bugs or issues, they should be discussed as a matter of priority
:::

Given a plan has been generated using [planning mode](./recipes.md#planning-mode) and [the plan is open](../Faq/is-the-plan-open-or-closed.md), this page will be accessible and provide

- A customer facing view of what meals are going to be cooked that week
- A way for customers to modify the quantities of a specific meal to their satisfaction

<figure>
![Choose Meals Page](/img/pages/choose-meals.png)
</figure>

## Delivery Day

Because different customers recieve their meals on different days, the `Monday` and `Wednesday` labels on the delivery day buttons are drawn from a [custom field](../Technical%20Documentation/integration-with-chargebee.md#data-model) attached to the customer's record in ChargeBee. If that field is not filled in, this will show as `delivery 1` and `delivery 2`

## Number of meals

Note that the number meals that a customer can pick is limited **per plan** across **both delivery days**. This can be a little confusing because it means that at any given time there are selections on a _different tab_ that will influence how many meals can be selected on the current tab. For example, on the screenshot above to work out how many meals can be selected on **current tab**

- The `Micro` and `Ultra Micro` tabs are **not relevant**
- The `Wednesday` button **is relevant**
