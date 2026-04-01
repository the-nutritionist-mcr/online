import { humanReadableDate } from '@/components/organisms/account/pause-utils';
import { ChargeBee } from "chargebee-typescript";
import { DateTime } from 'luxon';
import { handleSubscriptionEvent } from './handle-subscription-event';
import { calculatePauseCredit } from '../utils/calculate-pause-credit';

export const handleSubscriptionResumedTest = async (
  client: ChargeBee,
  customerId: string,
  subscriptionId: string,
  subscriptionMrr: number,
  pauseStartDate: string
) => {
  await handleSubscriptionEvent(client, customerId);

  if (!pauseStartDate?.length) return 'No pause start date set on subscription. This pause may have been set in ChargeBee, not via the TNM account page.';

  // get latest invoice so we can create a credit note
  const invoice = await new Promise<typeof client.invoice>(
    (accept, reject) => {
      client.invoice
        .list({
          limit: 1,
          subscription_id: { is: subscriptionId },
          status: { in: ["paid", "payment_due"] },
          "sort_by[desc]": "date"
        })
        .request(function(
          error: unknown,
          result: { list: typeof client.invoice[] }
        ) {
          if (error) {
            reject(error);
          } else {
            accept((result.list[0] as any).invoice);
          }
        });
    }
  )

  // calculate credit for paused period already billed (up to 1st of this month)
  const startDate = DateTime.fromISO(pauseStartDate).startOf('day');
  const resumeDate = DateTime.now().startOf('day').plus({ days: 2 });
  // const resumeDate = DateTime.fromISO("2023-07-05T00:00:00.000+00:00");
  // ^^^ use when testing in chargebee's time machine (when today is no longer DateTime.now())
  const { totalInCents: currencyProRatedAmount } = calculatePauseCredit({
    pauseStart: startDate,
    resumeDate,
    subscriptionMrr,
  });

  // issue credit note
  await new Promise<typeof client.credit_note>(
    (accept, reject) => {
      client.credit_note
        .create({
          reference_invoice_id: (invoice as any).id,
          total: currencyProRatedAmount,
          type: "REFUNDABLE",
          create_reason_code: "OTHER",
          customer_notes: `Subscription ${subscriptionId} paused from ${humanReadableDate(startDate, true)}, resumed on ${humanReadableDate(resumeDate, true)}.`
        })
        .request(function(
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
    }
  );

  // clear pause date in custom field
  await new Promise<typeof client.subscription>(
    (accept, reject) => {
      client.subscription
        .update_for_items(subscriptionId, {
          cf_Pause_date_ISO: '',
        } as any)
        .request(function(
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
    }
  );
};
