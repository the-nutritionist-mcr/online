import { FC, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateTime } from 'luxon';
import SchedulePauseButton from './schedulePauseButton';
import { PauseWeeks, humanReadableDate } from './pause-utils';
import { Input } from '@/components/ui/input';
import { clamp } from 'lodash';

interface PauseSelectorProps {
  handlePauseSelection: () => void;
}

const PauseSelector: FC<PauseSelectorProps> = ({ handlePauseSelection }) => {
  const [startDates, setStartDates] = useState<DateTime[]>([]);
  const [chosenDate, setChosenDate] = useState<DateTime | null>(null);
  const [showScheduleButton, setShowScheduleButton] = useState<boolean>(false);

  useEffect(() => {
    const date = DateTime.now();
    const nextMondayInAtLeast1Week: DateTime = date.weekday === 1
      ? date.plus({ weeks: 1 })
      : date.plus({ days: 7 - (date.weekday - 1), weeks: 1 });

    const dates: DateTime[] = [];
    for (let i: number = 0; i < 4; i++) {
      const date = nextMondayInAtLeast1Week.plus({ weeks: i });
      dates.push(date.minus({ days: 1 }));
    }
    setStartDates(dates);
  }, []);

  const handleChooseDate = (date: string) => {
    setShowScheduleButton(true);
    setChosenDate(DateTime.fromISO(date));
  }

  useEffect(() => {
    if (chosenDate) console.log('date chosen:', humanReadableDate(chosenDate));
  }, [chosenDate]);

  const [pauseWeeks, setPauseWeeks] = useState<PauseWeeks>(1);

  return (
    <>
      <div className='grid grid-cols-[auto_1fr] gap-4 items-center'>
        <div>Pause for <Input
          type='number'
          value={pauseWeeks}
          onChange={e => setPauseWeeks(clamp(parseInt(e.target.value), 1, 4) as PauseWeeks)}
          className='inline-block relative max-w-[60px] rounded-[3px] shadow-none text-[16px] leading-6 py-5 mx-1 border-black'
        /> week{pauseWeeks > 1 ? 's' : ''} from</div>
        <div>
          <Select onValueChange={handleChooseDate}>
            <SelectTrigger className="max-w-[300px] rounded-[3px] shadow-none text-[16px] leading-6 py-5 border-black">
              <SelectValue placeholder="Select a start date" />
            </SelectTrigger>
            {
              startDates.length > 0 &&
              <SelectContent>
                <SelectGroup>
                  {
                    startDates.map((date: DateTime) => {
                      return (
                        <SelectItem className='text-[16px] leading-6' value={date.toISODate() ?? ''} key={date.toISODate()}>
                          {humanReadableDate(date.plus({ days: 1 }))}
                        </SelectItem>
                      )
                    })
                  }
                </SelectGroup>
              </SelectContent>
            }
          </Select>
        </div>
      </div>
      {
        showScheduleButton &&
        <div>
          <SchedulePauseButton
            pauseDate={chosenDate ?? null}
            pauseWeeks={pauseWeeks ?? 1}
            handlePauseSelection={handlePauseSelection}
          />
        </div>
      }
    </>
  )
}

export default PauseSelector;