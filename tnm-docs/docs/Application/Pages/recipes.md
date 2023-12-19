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

The [recipes](https://portal.thenutritionistmcr.com/admin/recipes) page maintains a database of all the recipes that are available to be cooked which can then be edited by clicking on the pencil icon. On the edit page you are able to edit the details that are printed on the planner (and associated reports) but also in some cases on customer facing outputs such as the [choose meals page](./choose-meals.md) and the meal [label](../Features/labels.md). It also allows you to configure

1. Customisations
2. [Exclusions](../Features/meal-plan-generation.md#exclusions)
3. [Alternates](../Features/meal-plan-generation.md#alternates)

<figure>
![Edit Recipes Page](/img/pages/edit-recipes.png)
</figure>

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
