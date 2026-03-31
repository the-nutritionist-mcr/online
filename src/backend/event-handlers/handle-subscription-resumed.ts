import { humanReadableDate } from "@/components/organisms/account/pause-utils";
import { ChargeBee } from "chargebee-typescript";
import { DateTime } from "luxon";
import { handleSubscriptionEvent } from "./handle-subscription-event";
import { calculatePauseCredit } from "../utils/calculate-pause-credit";
import {
  findInvoiceContainingDate,
  getInvoiceBilledPeriod,
  getPauseCreditNoteType,
} from "../utils/select-pause-credit-invoice";

export const handleSubscriptionResumed = async (
  client: ChargeBee,
  customerId: string,
  subscriptionId: string,
  subscriptionMrr: number,
  pauseStartDate: string,
  resumedAt: string
) => {
  await handleSubscriptionEvent(client, customerId);

  if (!pauseStartDate?.length)
    return "No pause start date set on subscription. This pause may have been set in ChargeBee, not via the TNM account page.";

  const startDate = DateTime.fromISO(pauseStartDate).startOf("day");
  const resumeDate = DateTime.fromISO(resumedAt).startOf("day");

  // get recent eligible invoices so we can select the billed term to credit
  const invoices = await new Promise<any[]>((accept, reject) => {
    client.invoice
      .list({
        limit: 100,
        subscription_id: { is: subscriptionId },
        status: { in: ["paid", "payment_due"] },
        "sort_by[desc]": "date",
      })
      .request(function (
        error: unknown,
        result: { list: Array<{ invoice: Record<string, unknown> }> }
      ) {
        if (error) {
          reject(error);
        } else {
          accept(result.list.map((entry) => entry.invoice));
        }
      });
  });

  const startInvoice = findInvoiceContainingDate({
    date: startDate,
    invoices,
  });

  if (!startInvoice) {
    throw new Error(
      `No paid or payment_due invoice found containing pause start date for subscription ${subscriptionId}.`
    );
  }

  const resumeInvoice = findInvoiceContainingDate({
    date: resumeDate,
    invoices,
  });

  if ((resumeInvoice as any)?.id === (startInvoice as any).id) {
    await new Promise<typeof client.subscription>((accept, reject) => {
      client.subscription
        .update_for_items(subscriptionId, {
          cf_Pause_date_ISO: "",
        } as any)
        .request(function (
          error: unknown,
          result: { subscription: typeof client.subscription }
        ) {
          if (error) {
            reject(error);
          } else {
            accept(result.subscription);
          }
        });
    });

    return;
  }

  const { billedPeriodStart, billedPeriodEnd } =
    getInvoiceBilledPeriod(startInvoice);
  const { totalInCents: currencyProRatedAmount } = calculatePauseCredit({
    pauseStart: startDate,
    resumeDate,
    subscriptionMrr,
    billedPeriodStart,
    billedPeriodEnd,
  });

  if (currencyProRatedAmount <= 0) {
    await new Promise<typeof client.subscription>((accept, reject) => {
      client.subscription
        .update_for_items(subscriptionId, {
          cf_Pause_date_ISO: "",
        } as any)
        .request(function (
          error: unknown,
          result: { subscription: typeof client.subscription }
        ) {
          if (error) {
            reject(error);
          } else {
            const subscription: typeof client.subscription =
              result.subscription;
            accept(subscription);
          }
        });
    });

    return;
  }

  // issue credit note
  await new Promise<typeof client.credit_note>((accept, reject) => {
    client.credit_note
      .create({
        reference_invoice_id: (startInvoice as any).id,
        total: currencyProRatedAmount,
        type: getPauseCreditNoteType((startInvoice as any).status),
        create_reason_code: "OTHER",
        customer_notes: `Subscription ${subscriptionId} paused from ${humanReadableDate(
          startDate,
          true
        )}, resumed on ${humanReadableDate(resumeDate, true)}.`,
      })
      .request(function (
        error: unknown,
        result: { credit_note: typeof client.credit_note }
      ) {
        if (error) {
          reject(error);
        } else {
          const credit_note: typeof client.credit_note = result.credit_note;
          accept(credit_note);
        }
      });
  });

  // clear pause date in custom field
  await new Promise<typeof client.subscription>((accept, reject) => {
    client.subscription
      .update_for_items(subscriptionId, {
        cf_Pause_date_ISO: "",
      } as any)
      .request(function (
        error: unknown,
        result: { subscription: typeof client.subscription }
      ) {
        if (error) {
          reject(error);
        } else {
          const subscription: typeof client.subscription = result.subscription;
          accept(subscription);
        }
      });
  });
};
