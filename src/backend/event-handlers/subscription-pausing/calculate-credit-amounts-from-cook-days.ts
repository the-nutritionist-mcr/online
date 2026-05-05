import { Invoice } from "chargebee-typescript/lib/resources";
import { DateTime } from "luxon";

const SUNDAY = 7;
const WEDNESDAY = 3;

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

export type PauseCreditParams = {
  pauseStart: DateTime;
  resumeDate: DateTime;
  subscriptionMrr: number;
  invoices: Invoice[];
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
  invoices,
  subscriptionMrr,
}: PauseCreditParams) => {
  const missedDays = collectMissedCookDays({ pauseStart, resumeDate });

  const subscriptions = new Map<string, DateTime[]>();

  for (const day of missedDays) {
    const matchingInvoice = invoices.find(
      (invoice) =>
        invoice.date && DateTime.fromSeconds(invoice.date).hasSame(day, "month")
    );

    if (!matchingInvoice) {
      continue;
    }

    subscriptions.set(matchingInvoice.id, [
      ...(subscriptions.get(matchingInvoice.id) ?? []),
      day,
    ]);
  }

  const finalReturnValue = new Map<
    string,
    { dates: DateTime[]; credit: number }
  >();

  const weeklyRate = (subscriptionMrr * MONTHS_PER_YEAR) / WEEKS_PER_YEAR;

  for (const [id, dates] of subscriptions) {
    finalReturnValue.set(id, { dates, credit: dates.length * weeklyRate });
  }

  return finalReturnValue;
};
