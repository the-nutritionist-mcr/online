import { ChargeBee } from "chargebee-typescript";
import { Event } from "chargebee-typescript/lib/resources";
import { getRelevantInvoices } from "./subscription-pausing/get-invoice-containing-date";
import { DateTime } from "luxon";
import { getPauseDate } from "./subscription-pausing/get-pause-date";
import { setPauseDate } from "./subscription-pausing/set-pause-date";
import { calculateSubscriptionTotal } from "./subscription-pausing/calculate-subscription-total";
import { calculateCreditAmountsFromCookDays } from "./subscription-pausing/calculate-credit-amounts-from-cook-days";
import { creditInvoice } from "./subscription-pausing/credit-invoices";

export const updatedHandledSubscriptionResumed = async (
  client: ChargeBee,
  event: Event
) => {
  if (event.content.customer.email !== "bwainwright28@gmail.com") {
    return;
  }
  const subscriptionId = event.content.subscription.id;

  const subscriptionMrr = calculateSubscriptionTotal(
    event.content.subscription
  );

  const pauseStart = getPauseDate(event);

  const resumeDate = DateTime.fromSeconds(event.occurred_at);

  if (!subscriptionMrr) {
    return;
  }

  const invoices = await getRelevantInvoices(
    client,
    subscriptionId,
    pauseStart,
    resumeDate
  );

  const amounts = calculateCreditAmountsFromCookDays({
    pauseStart,
    resumeDate,
    invoices,
    subscriptionMrr,
  });

  for (const [invoiceId, invoiceAmounts] of amounts) {
    const theInvoice = invoices.find((invoice) => invoice.id === invoiceId);
    if (theInvoice) {
      await creditInvoice(client, {
        pauseStart,
        resumeDate,
        invoice: theInvoice,
        missedCookDays: invoiceAmounts,
      });
    }
  }

  await setPauseDate(client, subscriptionId, null);
};
