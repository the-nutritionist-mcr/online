import {
  MealPlanGeneratedForIndividualCustomer,
  PlanWithMeals,
  StandardPlan,
} from '@tnmo/types';
import { countMealsInPlans } from './count-plans';
import { totalFromSamePlan } from './total-from-same-plan';

export const totalOtherSelected = (
  selectedMeals: MealPlanGeneratedForIndividualCustomer,
  chosenPlan: PlanWithMeals,
  standardPlan: StandardPlan
) => {
  const allFromThisPlan = totalFromSamePlan(standardPlan, selectedMeals);

  const thisPlanTotal = countMealsInPlans(chosenPlan);

  return allFromThisPlan - thisPlanTotal;
};
