import { ChargeBee } from "chargebee-typescript";
import { CreditNote, Invoice } from "chargebee-typescript/lib/resources";

interface CreditNoteDetails {
  amount: number;
  invoice: Invoice;
  notes: string;
  reason: string;
}

const serialiseError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "object" && error !== null) {
    return {
      ...error,
    };
  }

  return { message: String(error) };
};

export const applyCreditNoteToInvoice = async (
  client: ChargeBee,
  { amount, invoice, notes, reason }: CreditNoteDetails
) => {
  if (amount <= 0) {
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
        total: Math.ceil(amount),
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
            console.error("Chargebee credit note creation failed", {
              invoiceId: invoice.id,
              invoiceStatus: invoice.status,
              requestedAmount: amount,
              roundedAmount: Math.ceil(amount),
              creditNoteType,
              reason,
              error: serialiseError(error),
            });
            reject(error);
            return;
          }

          resolve(result.credit_note);
        }
      );
  });
};
