import { FC, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateTime } from 'luxon';

const PauseSelector: FC<{}> = () => {
  const [startDates, setStartDates] = useState<DateTime[]>([]);

  useEffect(() => {
    const date = DateTime.now();
    console.log("Date from (now):", date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY));
    console.log("Weekday:", date.weekday);

    const nextMondayInAtLeast1Week: DateTime =
      date.weekday === 1
        ? date.plus({ weeks: 1 })
        : date.plus({ days: 7 - (date.weekday - 1), weeks: 1 });
    console.log(
      "Next Monday at least a week away:",
      nextMondayInAtLeast1Week.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
    );

    const dates: DateTime[] = [];
    for (let i: number = 0; i < 4; i++) {
      const date = nextMondayInAtLeast1Week.plus({ weeks: i });
      dates.push(date);
    }
    setStartDates(dates);
  }, []);

  return (
    <div className='grid grid-cols-[auto_1fr] gap-4 items-center'>
      <div>Pause for 1 week from</div>
      <div>
        <Select>
          <SelectTrigger className="max-w-[300px] rounded-[2px] shadow-none text-[16px] leading-6 py-5 border-black">
            <SelectValue placeholder="Select a start date" />
          </SelectTrigger>
          {
            startDates.length > 0 &&
            <SelectContent>
              {
                startDates.map((date: DateTime) => {
                  return (
                    <SelectItem value={date.toISODate() ?? ''} key={date.toISODate()}>
                      {date.toLocaleString(DateTime.DATE_HUGE)}
                    </SelectItem>
                  )
                })
              }
            </SelectContent>
          }
        </Select>
      </div>
    </div>
  )
}

export default PauseSelector;