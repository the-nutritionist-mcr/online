import { DateTime } from "luxon";
import { applyCreditNoteToInvoice } from "./apply-credit-note-to-invoice";
import { ChargeBee } from "chargebee-typescript";
import { Invoice } from "chargebee-typescript/lib/resources";
import { generateCreditNoteCustomerNote } from "./generate-credit-note-customer-note";

const SUBSCRIPTION_PAUSED_REASON_CODE = "Subscription Paused";

interface CreditInvoicesParams {
  pauseStart: DateTime;
  resumeDate: DateTime;
  missedCookDays: { dates: DateTime[]; credit: number };
  invoice: Invoice;
}

export const creditInvoice = async (
  client: ChargeBee,
  { pauseStart, resumeDate, missedCookDays, invoice }: CreditInvoicesParams
) => {
  const notes = generateCreditNoteCustomerNote({
    pauseStart,
    resumeDate,
    missedCookDays,
    invoice,
  });

  await applyCreditNoteToInvoice(client, {
    amount: missedCookDays.credit,
    invoice: invoice,
    reason: SUBSCRIPTION_PAUSED_REASON_CODE,
    notes,
  });
};
