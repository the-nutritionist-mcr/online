import { DateTime } from "luxon";

interface CreditNoteNoteParams {
  start: DateTime;
  resume: DateTime;
  creditDays: number;
  mrr: number;
}

export const generateCreditNoteCustomerNote = ({
  creditDays,
  start,
  resume,
  mrr,
}: CreditNoteNoteParams) => {
  const daysString = `day${creditDays === 1 ? "" : "s"}`;

  const GBP = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  const mrrPounds = GBP.format(mrr / 100);

  return `Paused from ${start.toLocaleString(
    DateTime.DATE_SHORT
  )} to ${resume.toLocaleString(
    DateTime.DATE_SHORT
  )}. Crediting for ${creditDays} ${daysString} = ((${mrrPounds} x Months in year) / Days in year) x ${creditDays}`;
};
