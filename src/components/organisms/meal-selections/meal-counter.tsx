import { QuantityStepper } from '../../molecules';
import { uniqueId } from 'lodash';
import { FC, useMemo } from 'react';
import {
  container,
  details,
  description,
  divider,
  header,
  nutritionAndAllergyLink,
} from './meal-counter.css';
import { cn } from '../../../../@/lib/utils';

export interface MealCounterProps {
  title: string;
  description?: string;
  contains?: string;
  userExclusions?: string[];
  value?: number;
  onChange?: (newValue: number) => void;
  max?: number;
  min?: number;
}

const MealCounter: FC<MealCounterProps> = (props) => {
  const headerId = useMemo(() => uniqueId(), []);
  const contains = props.contains ? props.contains : 'no allergens';
  const mealRemoved = props.userExclusions?.length;

  return (
    <section className={container} aria-labelledby={headerId}>
      <div className={details}>
        <div className={cn('grid relative items-start grid-flow-col', mealRemoved ? 'opacity-40' : '')}>
          <h3 className={header} id={headerId}>
            {props.title.toLocaleLowerCase()}
          </h3>
        </div>

        <p className={cn(description, mealRemoved ? 'opacity-40' : '')}>{props.description}</p>
        <hr className={cn(divider, mealRemoved ? 'opacity-40' : '')} />
        {
          mealRemoved ?
            <div className='grid relative place-content-center py-2 px-3 font-acumin-pro-semi-condensed font-semibold bg-[#d4f9e3]'>
              We've removed this meal from your menu as it contains some ingredients which don't suit your dietary preferences
            </div>
            : <p className={nutritionAndAllergyLink}>Contains {contains}</p>
        }
      </div>
      {
        props.userExclusions?.length
          ? props.userExclusions.map((exclusion, idx) => (
            <div key={idx} className='grid w-full h-full place-content-center'>
              <div className='inline-grid h-auto py-2 leading-0 px-4 rounded-full border-solid bg-[#3b7d7a] font-acumin-pro-semi-condensed font-semibold text-white'>
                {exclusion}
              </div>
            </div>
          ))
          : <QuantityStepper
            onChange={props.onChange}
            value={props.value ?? 0}
            min={props.min ?? 0}
            max={props.max ?? 0}
          />
      }
    </section>
  );
};

export default MealCounter;
