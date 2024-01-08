import { FC, useContext, useState } from 'react';
import styled from '@emotion/styled';
import { Button } from '../../atoms';
import { CONTACT_EMAIL } from '@tnmo/constants';
import { ParagraphText } from '@tnmo/components';
import { InitialSelections } from './initial-selections';
import { ConfirmSelections } from './confirm-selections';
import {
  Recipe,
  BackendCustomer,
  PlannedCook,
  WeeklyCookPlanWithoutCustomerPlans,
  Exclusion,
  DeliveryItem
} from '@tnmo/types';
import {
  container,
  header,
  headerButtons,
  headerText,
} from './initial-selections.css';
import { goAheadAndSubmit } from './confirm-selections-container.css';
import { MealPlanGeneratedForIndividualCustomer } from '@tnmo/types';
import { countRemainingMeals } from './count-remaining-meals';
import { getCookStatus } from '@tnmo/meal-planning';
import { NavigationContext } from '@tnmo/utils';
import { useMe } from '../../../hooks/use-me';

export interface ChooseMealsCustomer {
  customisations?: BackendCustomer['customisations'];
}

export interface MealSelectionsProps {
  plan: WeeklyCookPlanWithoutCustomerPlans;
  currentSelection: MealPlanGeneratedForIndividualCustomer;
  cooks: PlannedCook[];
  submitOrder: (
    payload: MealPlanGeneratedForIndividualCustomer
  ) => Promise<void>;
  recipes: Recipe[];
  customer: BackendCustomer;
}

const DivContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 2rem;
`;

const MealSelections: FC<MealSelectionsProps> = (props) => {
  const { navigate } = useContext(NavigationContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const user = useMe();

  const recipesMinusUserExclusions: Set<string> = new Set();
  props.cooks.forEach(cook => {
    cook.menu.forEach(recipe => {
      let allowRecipe = true;
      user?.customisations?.forEach(customisation => {
        if (recipe.invalidExclusions === undefined) return;
        if (recipe.invalidExclusions.includes(customisation.id)) allowRecipe = false;
      });      
      if (allowRecipe) recipesMinusUserExclusions.add(recipe.id);
    });
  });

  const deliveriesFiltered = props.currentSelection.deliveries.map(delivery => {
    if (delivery.paused === true) return delivery;
    const plansFiltered = delivery.plans.map(plan => {
      if (plan.status !== 'active') return plan;
      return {
        ...plan,
        meals: plan.meals.filter(meal => {
          if (meal.isExtra) return false;
          if (recipesMinusUserExclusions.has(meal.recipe.id)) return true;
        })
      }
    });
    return {
      ...delivery,
      plans: plansFiltered
    }
  });

  const currentSelectionFiltered = {
    ...props.currentSelection,
    deliveries: deliveriesFiltered
  };

  const [selectedMeals, setSelectedMeals] = useState<MealPlanGeneratedForIndividualCustomer>(currentSelectionFiltered);

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [complete, setComplete] = useState(false);

  const customerPlans = props.cooks.flatMap((cook) =>
    props.customer.plans.filter(
      (plan) =>
        getCookStatus(cook.date, plan).status === 'active' && !plan.isExtra
    )
  );

  const remainingWithoutExtras = countRemainingMeals(
    selectedMeals,
    customerPlans
  );

  const totalRemaining = Object.values(remainingWithoutExtras).reduce(
    (total, value) => total + value,
    0
  );

  const [tabIndex, setTabIndex] = useState(0);

  const next = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
    } else {
      setSubmittingOrder(true);
      await props.submitOrder({ ...selectedMeals, wasUpdatedByCustomer: true });
      setSubmittingOrder(false);
      setComplete(true);
    }
  };

  const prev = () => {
    if (showConfirm) {
      setShowConfirm(false);
    } else {
      navigate?.('/account/');
    }
  };

  const Label = styled('div')`
    margin-top: 1rem;
  `;

  const continueButtonDisabled = totalRemaining !== 0;

  return props.currentSelection.deliveries.length === 0 ? (
    <Label>
      <ParagraphText>
        It looks like you've not got any meals available yet. If this is wrong,
        get in touch with us at {CONTACT_EMAIL} to let us know
      </ParagraphText>
    </Label>
  ) : (
    <DivContainer>
      {!showConfirm ? (
        <div className={container}>
          <h2 className={header}>
            <div className={headerButtons}>
              <Button
                size="large"
                onClick={prev}
                disabled={submittingOrder || complete}
              >
                Go Back
              </Button>
              <Button
                size="large"
                primary
                color="callToAction"
                onClick={next}
                disabled={continueButtonDisabled || submittingOrder || complete}
              >
                {showConfirm
                  ? submittingOrder
                    ? 'Submitting...'
                    : 'Submit'
                  : 'Continue'}
              </Button>
            </div>
          </h2>
          <InitialSelections
            {...props}
            currentSelection={selectedMeals}
            customer={props.customer}
            setSelectedMeals={setSelectedMeals}
            recipes={props.recipes}
            recipesMinusUserExclusions={recipesMinusUserExclusions}
            currentTabIndex={tabIndex}
            onChangeIndex={(index) => {
              setTabIndex(index);
            }}
          />
        </div>
      ) : (
        <div className={container}>
          {!complete ? (
            <h2 className={header}>
              <span className={headerText}>Confirm Your Order</span>
              <div className={headerButtons}>
                <Button
                  size="large"
                  onClick={prev}
                  disabled={submittingOrder || complete}
                >
                  Go Back
                </Button>
                <Button
                  size="large"
                  primary
                  color="callToAction"
                  onClick={next}
                  disabled={
                    continueButtonDisabled || submittingOrder || complete
                  }
                >
                  {showConfirm
                    ? submittingOrder
                      ? 'Submitting...'
                      : 'Submit'
                    : 'Continue'}
                </Button>
              </div>
            </h2>
          ) : (
            <h2 className={header}>Thank You</h2>
          )}
          {!complete ? (
            <p className={goAheadAndSubmit}>
              If you are happy with your choices, go ahead and press submit
            </p>
          ) : (
            <p className={goAheadAndSubmit}>
              Your choices have been submitted!
            </p>
          )}
          <ConfirmSelections
            recipes={props.recipes}
            customer={props.customer}
            complete={complete}
            selectedMeals={selectedMeals}
          />
        </div>
      )}
    </DivContainer>
  );
};

export default MealSelections;
