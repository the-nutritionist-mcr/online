---
id: cook-plan
title: PDF Reports
sidebar_position: 3
tags:
  - Cook Plan
  - Pack Plan
  - PDF
  - Report

description: PDF Reports that the application generates to support business operations
---

Once the [meal plan has been generated](./meal-plan-generation.md), clicking the `downloads` button allows you to download the following artifacts

## Cook Plan

This is a PDF report which the kitchen uses to run its operations. It tells the kitchen

- How many of each meal to cook without customisations
- How many specific [customised](../Features/meal-plan-generation.md#customisations) meals to cook and who they are for, identifying allergens in purple
- How many specific [alternates](../Features/meal-plan-generation.md#alternates) to cook and who they are for
- The total number of meals of a given size

## Pack Plan

Once the meals are cooked, the kitchen will have 5/600 labelled meal tubs sitting around which need to be sorted into bags. The pack plan sets out exactly what meals each customer should be getting, to ensure that the bags can be packed correctly.

## Meal Label Data

This download provides a zip file containing, for each recipe, a CSV file that has a row for each cooked meal tub. This CSV is then imported into a [bartender](https://bartenderlabelsoftware.co.uk/) template which is then used to print all the labels for each tub

## Address Data

This is a CSV export which 
