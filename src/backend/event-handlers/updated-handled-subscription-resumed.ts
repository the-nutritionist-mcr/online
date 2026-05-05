import { ChargeBee } from "chargebee-typescript";
import { Event } from "chargebee-typescript/lib/resources";
import { getInvoiceContainingDate } from "./subscription-pausing/get-invoice-containing-date";
import { DateTime } from "luxon";
import { calculatePauseCredit } from "./subscription-pausing/calculate-credit-note-amount";
import { applyCreditNoteToInvoice } from "./subscription-pausing/apply-credit-note-to-invoice";
import { getPauseDate } from "./subscription-pausing/get-pause-date";
import { setPauseDate } from "./subscription-pausing/set-pause-date";

const SUBSCRIPTION_PAUSED_REASON_CODE = "Subscription Paused";

export const updatedHandledSubscriptionResumed = async (
  client: ChargeBee,
  event: Event
) => {
  const subscriptionId = event.content.subscription.id;
  const subscriptionMrr = event.content.subscription.mrr;
  const pauseStart = getPauseDate(event);

  /*
   * The UI manually sets a pause resume date thats two days short in order to ensure
   * they are included in the cook plan on the day they resume.
   *
   * This results in the final week being 4 days rather than six
   * so we add the extra two days on here for billing purposes.
   */
  const resumeDate = DateTime.fromSeconds(event.occurred_at).plus({ days: 2 });

  if (!subscriptionMrr) {
    return;
  }

  const invoice = await getInvoiceContainingDate(
    client,
    subscriptionId,
    pauseStart
  );

  const pauseCredit = calculatePauseCredit({
    pauseStart,
    resumeDate,
    subscriptionMrr,
  });

  await applyCreditNoteToInvoice(client, {
    credit: pauseCredit,
    invoice,
    reason: SUBSCRIPTION_PAUSED_REASON_CODE,
    notes: `Pause credit for ${pauseCredit.creditDays} day${
      pauseCredit.creditDays === 1 ? "" : "s"
    }.`,
  });
  await setPauseDate(client, subscriptionId, null);
};
