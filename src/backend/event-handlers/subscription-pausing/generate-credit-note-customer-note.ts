import { Invoice } from "chargebee-typescript/lib/resources";
import { DateTime } from "luxon";

interface CreditNoteNoteParams {
  pauseStart: DateTime;
  resumeDate: DateTime;
  missedCookDays: { dates: DateTime[]; credit: number };
  invoice: Invoice;
}
export const generateCreditNoteCustomerNote = ({
  pauseStart,
  resumeDate,
  missedCookDays,
}: CreditNoteNoteParams) => {
  const daysString = `day${missedCookDays.dates.length === 1 ? "" : "s"}`;

  return `Paused from ${pauseStart.toLocaleString(
    DateTime.DATE_SHORT
  )} to ${resumeDate.toLocaleString(DateTime.DATE_SHORT)}. Crediting for ${
    missedCookDays.dates.length
  } missed cook${daysString}`;
};
