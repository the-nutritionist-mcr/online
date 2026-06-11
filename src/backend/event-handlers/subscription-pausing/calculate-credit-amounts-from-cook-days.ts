import { Invoice } from "chargebee-typescript/lib/resources";
import { DateTime } from "luxon";

const SUNDAY = 7;
const WEDNESDAY = 3;

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;
const COOKS_PER_WEEK = 2;

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

const invoiceContainsCookDay = (invoice: Invoice, day: DateTime) =>
  invoice.line_items?.some((lineItem) => {
    if (!lineItem.date_from || !lineItem.date_to) {
      return false;
    }

    const periodStart = DateTime.fromSeconds(lineItem.date_from);
    const periodEnd = DateTime.fromSeconds(lineItem.date_to);

    return day >= periodStart && day < periodEnd;
  });

export const calculateCreditAmountsFromCookDays = ({
  pauseStart,
  resumeDate,
  subscriptionMrr,
  invoices,
}: PauseCreditParams) => {
  const missedDays = collectMissedCookDays({ pauseStart, resumeDate });

  const daysByInvoice = new Map<string, DateTime[]>();
  const fallbackInvoice = invoices[0];

  for (const day of missedDays) {
    const matchingInvoice =
      invoices.find((invoice) => invoiceContainsCookDay(invoice, day)) ??
      fallbackInvoice;

    if (!matchingInvoice) {
      continue;
    }

    daysByInvoice.set(matchingInvoice.id, [
      ...(daysByInvoice.get(matchingInvoice.id) ?? []),
      day,
    ]);
  }

  const weeklyRate = (subscriptionMrr * MONTHS_PER_YEAR) / WEEKS_PER_YEAR;

  const credits = new Map<string, { dates: DateTime[]; credit: number }>();

  for (const [invoiceId, dates] of daysByInvoice) {
    credits.set(invoiceId, {
      dates,
      credit: Math.ceil((dates.length * weeklyRate) / COOKS_PER_WEEK),
    });
  }

  return credits;
};
