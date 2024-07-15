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
  const [resumeDates, setResumeDates] = useState<DateTime[]>([]);
  const [chosenPauseDate, setChosenPauseDate] = useState<DateTime | null>(null);
  const [chosenResumeDate, setChosenResumeDate] = useState<DateTime | null>(null);
  const [showScheduleButton, setShowScheduleButton] = useState<boolean>(false);

  useEffect(() => {
    const now = DateTime.now();

    const nextMondayInAtLeast1Week: DateTime = now.weekday === 1
      ? now.plus({ weeks: 1 })
      : now.plus({ days: 7 - (now.weekday - 1), weeks: 1 });

    const nextWednesdayInAtLeast1Week: DateTime = now.weekday === 4
      ? now.plus({ weeks: 1 })
      : now.plus({ days: 7 - (now.weekday - 4) });

    const dates: DateTime[] = [];
    for (let i: number = 0; i < 4; i++) {
      let date: DateTime = nextMondayInAtLeast1Week.plus({ weeks: i });
      dates.push(date.minus({ days: 1 }));
      date = nextWednesdayInAtLeast1Week.plus({ weeks: i });
      dates.push(date.minus({ days: 1 }));
    }
    setStartDates(dates);
  }, []);

  useEffect(() => {
    if (!chosenPauseDate) return;

    const nextMondayInAtLeast1Week: DateTime = chosenPauseDate.weekday === 1
      ? chosenPauseDate.plus({ weeks: 1 })
      : chosenPauseDate.plus({ days: 7 - (chosenPauseDate.weekday - 1), weeks: 1 });

    const nextWednesdayInAtLeast1Week: DateTime = chosenPauseDate.weekday === 4
      ? chosenPauseDate.plus({ weeks: 1 })
      : chosenPauseDate.plus({ days: 7 - (chosenPauseDate.weekday - 4) });

    const dates: DateTime[] = [];
    for (let i: number = 0; i < 4; i++) {
      let date: DateTime = nextMondayInAtLeast1Week.plus({ weeks: i });
      dates.push(date.minus({ days: 1 }));
      date = nextWednesdayInAtLeast1Week.plus({ weeks: i });
      dates.push(date.minus({ days: 1 }));
    }
    setResumeDates(dates);
  }, [chosenPauseDate]);

  const handleChoosePauseDate = (date: string) => {
    setShowScheduleButton(false);
    setChosenPauseDate(DateTime.fromISO(date));
  }

  const handleChooseResumeDate = (date: string) => {
    setShowScheduleButton(true);
    setChosenResumeDate(DateTime.fromISO(date));
  }

  useEffect(() => {
    if (chosenPauseDate) console.log('start date chosen:', humanReadableDate(chosenPauseDate));
  }, [chosenPauseDate]);

  useEffect(() => {
    if (chosenResumeDate) console.log('resume date chosen:', humanReadableDate(chosenResumeDate));
  }, [chosenResumeDate]);

  return (
    <>
      <div className='grid grid-cols-[auto_1fr] gap-4 items-center'>
        <div>Start pause on</div>
        <div>
          <Select onValueChange={handleChoosePauseDate}>
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
                        <SelectItem className='text-[16px] leading-6' value={date.toISODate() ?? ''} key={`pause_${date.toISODate()}`}>
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
        {
          chosenPauseDate &&
          <>
            <div>Resume on</div>
            <div>
              <Select onValueChange={handleChooseResumeDate}>
                <SelectTrigger className="max-w-[300px] rounded-[3px] shadow-none text-[16px] leading-6 py-5 border-black">
                  <SelectValue placeholder="Select a resume date" />
                </SelectTrigger>
                {
                  resumeDates.length > 0 &&
                  <SelectContent>
                    <SelectGroup>
                      {
                        resumeDates.map((date: DateTime) => {
                          return (
                            <SelectItem className='text-[16px] leading-6' value={date.toISODate() ?? ''} key={`resume_${date.toISODate()}`}>
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
          </>
        }
      </div>
      {
        showScheduleButton &&
        <div>
          <SchedulePauseButton
            pauseDate={chosenPauseDate ?? null}
            resumeDate={chosenResumeDate ?? null}
            handlePauseSelection={handlePauseSelection}
          />
        </div>
      }
    </>
  )
}

export default PauseSelector;