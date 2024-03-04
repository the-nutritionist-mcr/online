import { QuantityStepper } from '../../molecules';
import { uniqueId } from 'lodash';
import { FC } from 'react';
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
  const headerId = uniqueId();
  const contains = props.contains ? props.contains : 'no allergens';

  return (
    <section className={container} aria-labelledby={headerId}>
      <div className={cn(details, props.userExclusions?.length ? 'opacity-40' : '')}>
        <h3 className={cn(header)} id={headerId}>
          {props.title.toLocaleLowerCase()}
        </h3>

        <p className={description}>{props.description}</p>
        <hr className={divider} />
        <p className={nutritionAndAllergyLink}>Contains {contains}</p>
      </div>
      {
        props.userExclusions?.length
          ? props.userExclusions.map(exclusion => (
            <div className='grid w-full h-full place-content-center'>
              <div className='inline-grid h-auto py-2 leading-0 px-4 border-2 rounded-sm border-solid border-[#3b7d7a] font-acumin-pro-semi-condensed font-semibold'>
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
