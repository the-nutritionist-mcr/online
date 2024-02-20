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
import { useMe } from '@/hooks/use-me';

interface MealListProps {
  menu: Recipe[];
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
  const user = useMe();

  return (
    <div className={mealListGrid}>
      {
        props.menu.map(menuItem => {
          const realRecipe = getRealRecipe(menuItem, props.customer, props.recipes);
          console.log('realRecipe:', realRecipe);

          const countOfThisRecipe = props.selected.meals.filter(
            (meal) => !meal.isExtra && meal.recipe.id === menuItem.id
          ).length;

          let userExclusions: string[] = [];
          user?.customisations?.forEach(customisation => {
            if (realRecipe.invalidExclusions === undefined) return;
            if (realRecipe.invalidExclusions.includes(customisation.id)) {
              userExclusions.push(customisation.name);
            }
          });

          return (
            <MealCounter
              key={menuItem.id}
              title={realRecipe.name ?? ''}
              description={realRecipe.description ?? ''}
              contains={menuItem.allergens}
              userExclusions={userExclusions}
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
