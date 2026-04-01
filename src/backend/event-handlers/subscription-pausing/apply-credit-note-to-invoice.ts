import { ChargeBee } from "chargebee-typescript";
import { CreditNote, Invoice } from "chargebee-typescript/lib/resources";

interface CreditNoteDetails {
  credit: { creditDays: number; totalInCents: number };
  invoice: Invoice;
  notes: string;
  reason: string;
}

export const applyCreditNoteToInvoice = async (
  client: ChargeBee,
  { credit, invoice, notes, reason }: CreditNoteDetails
) => {
  if (credit.totalInCents <= 0) {
    return;
  }

  const creditNoteType =
    invoice.status === "paid"
      ? "REFUNDABLE"
      : invoice.status === "payment_due" ||
        invoice.status === "not_paid" ||
        invoice.status === "posted"
      ? "ADJUSTMENT"
      : null;

  if (!creditNoteType) {
    throw new Error(
      `Cannot create a credit note for invoice ${invoice.id} with status ${invoice.status}.`
    );
  }

  await new Promise<CreditNote>((resolve, reject) => {
    client.credit_note
      .create({
        reference_invoice_id: invoice.id,
        total: credit.totalInCents,
        type: creditNoteType,
        create_reason_code: reason,
        customer_notes: notes,
      })
      .request(
        (
          error: unknown,
          result: {
            credit_note: CreditNote;
          }
        ) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result.credit_note);
        }
      );
  });
};
