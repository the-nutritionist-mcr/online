---
id: meal-plan-generation
title: Automatic Meal Plan Generation
tags:
  - Planning Mode
  - Planning
  - Meal Selection
  - Algorithm
  - Pause
  - Pauses
  - Meals per delivery
  - Meals per day
  - Meals per week
  - Subscription status

description: Details of how the planning algorithm works
---

# Automatic Meal Plan Generation

Once a selection of recipes has been picked using [planning mode](../Pages/recipes.md#planning-mode) on the recipes page, the system will automatically generate a plan containing details of exactly what meals should be cooked for each customer. It does so using the following set of rules

## Subscription status

Meals are only added to the plan for a given customer of the customer's chargebee status is expected to be `active` on the _date entered in the planning mode dialog box for a given cook_. This means if a customer is expected to be _paused_ on that date, they will get 0 meals

## Number of meals per delivery

To calculate how many meals should be allocated for a given plan on each delivery, the following algorithm is used. Note the following abbreviations

- MPD: Meals per day
- DPW: Days per week
- D1/D2: Delivery 1/Delivery 2

```mermaid
flowchart LR
    A{{Custom plan on record?}}-->|Yes|B([Use custom plan])
    A-->|No|D{{Is DPW an even number?}}
    D-->|Yes|E([D1 and D2 even split])
    D-->|No|F{{7 day plan?}}
    F-->|No|G(["D1: ((DPW + 1) / 2) x MPD, D2: (((DPW + 1) / 2) - 1) X MPD"])
    F-->|Yes|H(["D1: 4 x MPD, D2: 3 X MPD"])
```

## Allocating meals per plan

Given this number and a set of meals that the business has selected will be cooked, meals are then allocated on a rotating basis starting with the first recipe. So given the set of recipes A, B, C, D and E, if a customer has two plans, one Micro (with 6 meals in this delivery) and one Mass (with 3 meals in this delivery), they will be allocated in the following way

| Plan  |     |     |     |     |     |     |
| ----- | --- | --- | --- | --- | --- | --- |
| Micro | A   | B   | C   | D   | E   | A   |
| Mass  | A   | B   | C   |     |     |     |

### Exclusions

Given the same set of recipes, if recipe `B` is tagged with `no pork` as an `exclusion`, and a customer is tagged with `no pork`, the planning algorithm will simply skip recipe `B` when allocating. So you'll get a distribution that looks like this

| Plan  |     |     |     |     |     |     |
| ----- | --- | --- | --- | --- | --- | --- |
| Micro | A   | C   | D   | E   | A   | C   |
| Mass  | A   | C   | A   |     |     |     |

:::warning
At the time of writing, meal `B` will still be visible to the customer on the [choose meals](../Pages/choose-meals.md) page - with a quantity set to zero.
:::

### Alternates

It is possible to tag recipes as 'alternate' recipes. This means mark a recipe so that

- Given recipe D
- If the customer is tagged with `x`
- Supply recipe F instead

So given the same set of recipes, but assuming that the `D->F` alternate tag is applied and the customer has a matching tag, the distribution for that customer will now look like this

| Plan  |     |     |     |       |     |     |
| ----- | --- | --- | --- | ----- | --- | --- |
| Micro | A   | B   | C   | **F** | E   | A   |
| Mass  | A   | B   | C   |       |     |     |

:::info
This behaviour is recursive - if `F` were found to have an `F->G` alternate tag that also matches the tags attached to the customer, recipe `G` will be supplied instead
:::
