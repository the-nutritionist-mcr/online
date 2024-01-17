import { FC, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateTime } from 'luxon';
import MainButton from '@/components/ui/main-button';
import PauseButton from './pauseButton';

const PauseSelector = () => {
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
      dates.push(date);
    }
    setStartDates(dates);
  }, []);

  const handleChooseDate = (date: string) => {
    setShowScheduleButton(true);
    setChosenDate(DateTime.fromISO(date));
  }

  useEffect(() => {
    if (chosenDate) console.log(chosenDate.toLocaleString(DateTime.DATE_HUGE));
  }, [chosenDate]);

  return (
    <>
      <div className='grid grid-cols-[auto_1fr] gap-4 items-center'>
        <div>Pause for the week beginning</div>
        <div>
          <Select onValueChange={handleChooseDate}>
            <SelectTrigger className="max-w-[300px] rounded-[2px] shadow-none text-[16px] leading-6 py-5 border-black">
              <SelectValue placeholder="Select a start date" />
            </SelectTrigger>
            {
              startDates.length > 0 &&
              <SelectContent>
                <SelectGroup>
                  {/* <SelectLabel>Available pause dates</SelectLabel> */}
                  {
                    startDates.map((date: DateTime) => {
                      return (
                        <SelectItem className='text-[16px] leading-6' value={date.toISODate() ?? ''} key={date.toISODate()}>
                          {date.toLocaleString(DateTime.DATE_HUGE)}
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
          <PauseButton pauseDate={chosenDate ?? null} />
        </div>
      }
    </>
  )
}

export default PauseSelector;