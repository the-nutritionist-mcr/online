---
id: recipes
title: Recipes
tags:
  - Recipes
  - Planning Mode
  - Planning

description: The Recipes page and planning mode
---

# Recipes

On the admin portal, the [recipes](https://portal.thenutritionistmcr.com/admin/recipes) page maintains a database of all the recipes that are available to be cooked. Recipe entries store

- The details that will be printed on the label
- Tags that represent [customisations](./customisations.md) that can apply to this recipe
- A record of potential [alternates](./alternates.md) recipes given a particular tag is present on a customer

## Planning Mode

The recipes page provides a 'planning mode' the purpose of which is to allow the business to select which meals are going to be cooked over a given two week period. To use it:

- Click `Planning Mode`
- On the right hand side click `Pick Meals` under `Cook 1`
- Tick a checkbox next to all the meals that are to be included in the first cook of the week
- Input the date of the cook in the input box

:::warning
This date should be the date that the meals are actually _cooked_ on. When generating a meal plan, the application will compare this date with records of subscription pauses per customer in order to decide if they should receive meals or not
:::

- Click `Pick Meals` under `Cook 2`
- Tick a checkbox next to all the meals that are to be included in the first cook of the week
- Input the date of the cook in the input box
- Click `Send to Planner`

This will result in an [automatically generated plan](../Features/meal-plan-generation.md) being made available in the [planner](./planner.md) page.
