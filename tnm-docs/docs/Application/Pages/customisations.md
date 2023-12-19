---
id: customisations
title: Customisations
tags:
  - Customisations
  - Tags

description: Database of all the customisation tags that can be applied to customers or recipes
---

:::info
This page is **not customer facing**
:::

The core of this application is build around the concept of 'customisations'. These are simple tags which can apply to both [recipes](./recipes.md) and [customers](./customers.md). When generating a [plan](../Features/meal-plan-generation.md), if a customer is to be supplied with a recipe that includes a tag also attached to a customer, this is highlighted in a number of places

- **On the [meal label](../Features/labels.md)** - so the customer is confidence their food is correct
- **On the [cook plan](../Features/cook-plan.md)** - so the kitchen always cook the correct meal
- **On the [pack plan](../Features/pack-plan.md)** - so the correct meal is delivered to the customer

This page is a simple [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) database of all the tags that _can_ be applied.

<figure>
![Customisations page](/img/pages/customisations.png)
</figure>

## How customisations are used

The description above describes the _original_ use case for customisations. However, depending on [how we configure a specific recipe](../Pages/recipes.md#edit-recipe) the application in its current form can also use customisation tags to support

- When we don't want to supply a particular meal but we aren't going to swap it for another ([exclusions](../Features/meal-plan-generation.md#exclusions))
- When we should swap a meal for a different meal ([alternates](../Features/meal-plan-generation.md#alternates))
