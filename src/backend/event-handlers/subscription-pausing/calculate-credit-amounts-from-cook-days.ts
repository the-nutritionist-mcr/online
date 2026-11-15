import { Invoice } from "chargebee-typescript/lib/resources";
import { DateTime } from "luxon";
import { startOfUkCookDate } from "@/meal-planning/uk-cook-date";

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

  let newDay = startOfUkCookDate(pauseStart).set({ hour: 4 });
  const firstDayBack = startOfUkCookDate(resumeDate);

  while (newDay < firstDayBack) {
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

const calculateResumeMonthProration = ({
  pauseStart,
  resumeDate,
  subscriptionMrr,
  invoices,
}: PauseCreditParams) => {
  const firstDayBack = startOfUkCookDate(resumeDate);
  const monthStart = firstDayBack.startOf("month");
  if (startOfUkCookDate(pauseStart) > monthStart) {
    return 0;
  }

  let unbilledDays = 0;
  let day = monthStart.set({ hour: 4 });
  while (day < firstDayBack) {
    if (!invoices.some((invoice) => invoiceContainsCookDay(invoice, day))) {
      unbilledDays++;
    }
    day = day.plus({ days: 1 });
  }

  const regularTermDays = firstDayBack
    .plus({ months: 1 })
    .diff(firstDayBack, "days").days;
  return Math.round((subscriptionMrr * unbilledDays) / regularTermDays);
};

export const calculateCreditAmountsFromCookDays = ({
  pauseStart,
  resumeDate,
  subscriptionMrr,
  invoices,
}: PauseCreditParams) => {
  const missedDays = collectMissedCookDays({ pauseStart, resumeDate });

  const daysByInvoice = new Map<string, DateTime[]>();
  const fallbackInvoice = invoices[0];
  const resumeMonthStart = startOfUkCookDate(resumeDate).startOf("month");
  let unbilledResumeMonthCooks = 0;

  for (const day of missedDays) {
    const billedInvoice = invoices.find((invoice) =>
      invoiceContainsCookDay(invoice, day)
    );
    const matchingInvoice = billedInvoice ?? fallbackInvoice;

    if (!matchingInvoice) {
      continue;
    }

    if (!billedInvoice && day >= resumeMonthStart) {
      unbilledResumeMonthCooks++;
    }

    daysByInvoice.set(matchingInvoice.id, [
      ...(daysByInvoice.get(matchingInvoice.id) ?? []),
      day,
    ]);
  }

  const cookRate =
    (subscriptionMrr * MONTHS_PER_YEAR) / (WEEKS_PER_YEAR * COOKS_PER_WEEK);
  const proration = unbilledResumeMonthCooks
    ? calculateResumeMonthProration({
        pauseStart,
        resumeDate,
        subscriptionMrr,
        invoices,
      })
    : 0;

  const credits = new Map<string, { dates: DateTime[]; credit: number }>();

  for (const [invoiceId, dates] of daysByInvoice) {
    const grossCredit = Math.ceil(dates.length * cookRate);
    const unbilledCooks =
      invoiceId === fallbackInvoice?.id ? unbilledResumeMonthCooks : 0;
    const billedCredit = Math.ceil((dates.length - unbilledCooks) * cookRate);
    // Only offset the missed cooks covered by the resume-month proration.
    const credit =
      grossCredit - Math.min(proration, grossCredit - billedCredit);
    if (credit > 0) {
      credits.set(invoiceId, {
        dates:
          credit === billedCredit && unbilledCooks
            ? dates.filter(
                (day) =>
                  day < resumeMonthStart ||
                  invoiceContainsCookDay(fallbackInvoice, day)
              )
            : dates,
        credit,
      });
    }
  }

  return credits;
};
