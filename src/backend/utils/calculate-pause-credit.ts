import { DateTime } from "luxon";

type PauseCreditParams = {
  pauseStart: DateTime;
  resumeDate: DateTime;
  subscriptionMrr: number;
  billedPeriodStart?: DateTime;
  billedPeriodEnd?: DateTime;
};

const WEEKS_PER_YEAR = 52;
const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;

export const getPauseCreditDays = (
  pauseStart: DateTime,
  resumeDate: DateTime,
  billedPeriodStart?: DateTime,
  billedPeriodEnd?: DateTime
): number => {
  const start = pauseStart.startOf("day");
  const resume = resumeDate.startOf("day");

  if (resume <= start) return 0;

  const billedStart = billedPeriodStart?.startOf("day") ?? start;
  const billedEnd = billedPeriodEnd?.startOf("day") ?? resume;

  const creditPeriodStart = start > billedStart ? start : billedStart;
  const creditPeriodEnd = resume < billedEnd ? resume : billedEnd;

  return Math.max(0, Math.floor(creditPeriodEnd.diff(creditPeriodStart, "days").days));
};

export const calculatePauseCredit = ({
  pauseStart,
  resumeDate,
  subscriptionMrr,
  billedPeriodStart,
  billedPeriodEnd,
}: PauseCreditParams) => {
  const creditDays = getPauseCreditDays(
    pauseStart,
    resumeDate,
    billedPeriodStart,
    billedPeriodEnd
  );

  if (creditDays === 0 || subscriptionMrr <= 0) {
    return {
      creditDays,
      totalInCents: 0,
    };
  }

  const weeklyRate = (subscriptionMrr * MONTHS_PER_YEAR) / WEEKS_PER_YEAR;
  const dailyRate = weeklyRate / DAYS_PER_WEEK;

  return {
    creditDays,
    totalInCents: Math.ceil(dailyRate * creditDays),
  };
};
