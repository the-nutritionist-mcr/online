import MealCounter from './meal-counter';
import { mealListGrid } from './meal-list.css';
import { getRealRecipe } from '@tnmo/meal-planning';
import {
  ActivePlanWithMeals,
  BackendCustomer,
  Recipe,
  DeliveryMeal,
  StandardPlan,
} from '@tnmo/types';
import { countsFromPlans } from './count-from-plans';
import { planFromCounts } from './plan-from-counts';

interface MealListProps {
  things: Recipe[];
  customer: BackendCustomer;
  recipes: Recipe[];
  plan: StandardPlan;
  selected: ActivePlanWithMeals;
  setSelected: (things: ActivePlanWithMeals) => void;
  max: number;
}

const MealList = (props: MealListProps) => {
  const counts = countsFromPlans(props.selected);
  const max = props.max - props.selected.meals.length;

  console.log('THINGS:', props.things)
  console.log('MEALS:', props.selected.meals)

  return (
    <div className={mealListGrid}>
      {
        props.selected.meals.map(deliveryItem => {
          const meal = deliveryItem as DeliveryMeal;
          const realRecipe = getRealRecipe(meal.recipe, props.customer, props.recipes);

          const countOfThisRecipe = props.selected.meals.filter(
            (meal) => !meal.isExtra && meal.recipe.id === meal.recipe.id
          ).length;

          return (
            <MealCounter
              key={meal.recipe.id}
              title={realRecipe.name ?? ''}
              description={realRecipe.description ?? ''}
              contains={meal.recipe.allergens}
              value={counts[meal.recipe.id]}
              min={0}
              max={max + countOfThisRecipe}
              onChange={(value) => {
                const newCounts = { ...counts, [meal.recipe.id]: value };
                props.setSelected({
                  ...props.selected,
                  meals: planFromCounts(newCounts, props.things, props.plan.name),
                });
              }}
            />
          );
        })
      }
    </div>
  );
};

export default MealList;
