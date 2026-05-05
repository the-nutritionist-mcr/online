import { DateTime } from "luxon";

export type PauseCreditParams = {
  pauseStart: DateTime;
  resumeDate: DateTime;
  subscriptionMrr: number;
};

const WEEKS_PER_YEAR = 52;
const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;

const getPauseCreditDays = (
  pauseStart: DateTime,
  resumeDate: DateTime
): number => {
  const start = pauseStart.startOf("day");
  const resume = resumeDate.startOf("day");

  console.log(
    `Pause start: ${start.toLocaleString(
      DateTime.DATE_SHORT
    )}, end: ${resume.toLocaleString(DateTime.DATE_SHORT)}`
  );

  if (resume <= start) {
    console.log(
      `Resume and start are on the same date or reversed. Credit is zero`
    );
    return 0;
  }

  const creditPeriodEnd =
    start.month === resume.month ? resume : resume.startOf("month");

  console.log(
    `Credit period end: ${creditPeriodEnd.toLocaleString(DateTime.DATE_SHORT)}`
  );

  return Math.max(0, Math.floor(creditPeriodEnd.diff(start, "days").days));
};

export const calculatePauseCredit = ({
  pauseStart,
  resumeDate,
  subscriptionMrr,
}: PauseCreditParams) => {
  const creditDays = getPauseCreditDays(pauseStart, resumeDate);

  if (creditDays === 0 || subscriptionMrr <= 0) {
    return {
      creditDays,
      totalInCents: 0,
    };
  }

  console.log(`Crediting for ${creditDays} days`);

  const dailyRate =
    (subscriptionMrr * MONTHS_PER_YEAR) / WEEKS_PER_YEAR / DAYS_PER_WEEK;

  console.log(
    `Daily rate = ((${subscriptionMrr} * ${MONTHS_PER_YEAR}) ${WEEKS_PER_YEAR}) / ${DAYS_PER_WEEK}`
  );

  const totalInCents = Math.ceil(dailyRate * creditDays);

  console.log(
    `Total credit = Math.ceil(${totalInCents} * ${creditDays}) = ${totalInCents}`
  );

  return {
    creditDays,
    totalInCents,
  };
};
