import { FC, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTime } from "luxon";
import SchedulePauseButton from "./schedulePauseButton";
import { humanReadableDate } from "./pause-utils";
import { getPauseDateCandidates } from "./get-pause-date-candidates";

interface PauseSelectorProps {
  handlePauseSelection: () => void;
}

const PauseSelector: FC<PauseSelectorProps> = ({ handlePauseSelection }) => {
  const [chosenPauseDate, setChosenPauseDate] = useState<DateTime | null>(null);
  const [chosenResumeDate, setChosenResumeDate] = useState<DateTime | null>(
    null
  );
  const [showScheduleButton, setShowScheduleButton] = useState<boolean>(false);

  const startDates = getPauseDateCandidates(DateTime.now().plus({ weeks: 1 }));
  const resumeDates = getPauseDateCandidates(chosenPauseDate);

  const handleChoosePauseDate = (date: string) => {
    setShowScheduleButton(false);
    setChosenPauseDate(DateTime.fromISO(date));
  };

  const handleChooseResumeDate = (date: string) => {
    setShowScheduleButton(true);
    setChosenResumeDate(DateTime.fromISO(date));
  };

  useEffect(() => {
    if (chosenPauseDate) console.log("start date chosen:", chosenPauseDate);
  }, [chosenPauseDate]);

  useEffect(() => {
    if (chosenResumeDate)
      console.log("resume date chosen:", humanReadableDate(chosenResumeDate));
  }, [chosenResumeDate]);

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
        <div>Pause start</div>
        <div>
          <Select onValueChange={handleChoosePauseDate}>
            <SelectTrigger className="max-w-[300px] rounded-[3px] shadow-none text-[16px] leading-6 py-5 border-black">
              <SelectValue placeholder="Select a start date" />
            </SelectTrigger>
            {startDates.length > 0 && (
              <SelectContent>
                <SelectGroup>
                  {startDates.map((date: DateTime) => {
                    return (
                      <SelectItem
                        className="text-[16px] leading-6"
                        value={date.toISO() ?? ""}
                        key={`pause_${date.toISO()}`}
                      >
                        {humanReadableDate(date)}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            )}
          </Select>
        </div>
        {chosenPauseDate && (
          <>
            <div>Pause ends</div>
            <div>
              <Select onValueChange={handleChooseResumeDate}>
                <SelectTrigger className="max-w-[300px] rounded-[3px] shadow-none text-[16px] leading-6 py-5 border-black">
                  <SelectValue placeholder="Select a resume date" />
                </SelectTrigger>
                {resumeDates.length > 0 && (
                  <SelectContent>
                    <SelectGroup>
                      {resumeDates.map((date: DateTime) => {
                        return (
                          <SelectItem
                            className="text-[16px] leading-6"
                            value={date.toISO() ?? ""}
                            key={`resume_${date.toISO()}`}
                          >
                            {humanReadableDate(date)}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                )}
              </Select>
            </div>
          </>
        )}
      </div>
      {showScheduleButton && (
        <div>
          <SchedulePauseButton
            pauseDate={chosenPauseDate ?? null}
            resumeDate={chosenResumeDate ?? null}
            handlePauseSelection={handlePauseSelection}
          />
        </div>
      )}
    </>
  );
};

export default PauseSelector;
