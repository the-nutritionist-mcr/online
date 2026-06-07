import { DateTime } from "luxon";

const SUNDAY = 7;
const WEDNESDAY = 3;

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

export type PauseCreditParams = {
  pauseStart: DateTime;
  resumeDate: DateTime;
  subscriptionMrr: number;
};

const collectMissedCookDays = ({
  pauseStart,
  resumeDate,
}: {
  pauseStart: DateTime;
  resumeDate: DateTime;
}) => {
  const dates: DateTime[] = [];

  let newDay = DateTime.fromMillis(
    pauseStart.startOf("day").plus({ hours: 4 }).toMillis()
  );

  while (newDay < resumeDate.startOf("day")) {
    if (newDay.weekday === SUNDAY || newDay.weekday === WEDNESDAY) {
      dates.push(newDay);
    }
    newDay = newDay.plus({ days: 1 });
  }

  return dates;
};

export const calculateCreditAmountsFromCookDays = ({
  pauseStart,
  resumeDate,
  subscriptionMrr,
}: PauseCreditParams) => {
  const missedDays = collectMissedCookDays({ pauseStart, resumeDate });

  const weeklyRate = (subscriptionMrr * MONTHS_PER_YEAR) / WEEKS_PER_YEAR;

  return {
    dates: missedDays,
    credit: Math.ceil(missedDays.length * weeklyRate),
  };
};
