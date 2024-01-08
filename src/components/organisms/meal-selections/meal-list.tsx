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
  menu: Recipe[];
  customer: BackendCustomer;
  recipes: Recipe[];
  recipesMinusUserExclusions: Set<string>;
  plan: StandardPlan;
  selected: ActivePlanWithMeals;
  setSelected: (things: ActivePlanWithMeals) => void;
  max: number;
}

const MealList = (props: MealListProps) => {
  const counts = countsFromPlans(props.selected);
  const max = props.max - props.selected.meals.length;
  const allowedMenu = props.menu.filter(recipe => props.recipesMinusUserExclusions.has(recipe.id));

  return (
    <div className={mealListGrid}>
      {
        allowedMenu.map(menuItem => {
          const realRecipe = getRealRecipe(menuItem, props.customer, props.recipes);

          const countOfThisRecipe = props.selected.meals.filter(
            (meal) => !meal.isExtra && meal.recipe.id === menuItem.id
          ).length;

          return (
            <MealCounter
              key={menuItem.id}
              title={realRecipe.name ?? ''}
              description={realRecipe.description ?? ''}
              contains={menuItem.allergens}
              value={counts[menuItem.id]}
              min={0}
              max={max + countOfThisRecipe}
              onChange={(value) => {
                const newCounts = { ...counts, [menuItem.id]: value };
                props.setSelected({
                  ...props.selected,
                  meals: planFromCounts(newCounts, props.menu, props.plan.name),
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
