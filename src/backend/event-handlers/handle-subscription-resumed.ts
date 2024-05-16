import { ChargeBee } from "chargebee-typescript";
import { Customer } from 'chargebee-typescript/lib/resources';
import { handleSubscriptionEvent } from './handle-subscription-event';
import { apiRequest } from '@tnmo/core';
import { BackendCustomer } from '@tnmo/types';
import { chargebee } from '../lambdas/chargebee/initialise';
import { DateTime } from 'luxon';
import { humanReadableDate } from '@/components/organisms/account/pause-utils';

export const handleSubscriptionResumed = async (
  client: ChargeBee,
  customerId: string,
  subscriptionId: string,
  subscriptionMrr: number,
  pauseStartDate: string
) => {
  await handleSubscriptionEvent(client, customerId);

  console.log({
    customerId,
    subscriptionId,
    subscriptionMrr,
    pauseStartDate
  })

  if (!pauseStartDate || !subscriptionMrr) {
    console.log("*** stopping there.")
    return;
  }

  // await apiRequest<BackendCustomer>("chargebee-issue-pause-credit", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     "subscription_id": subscriptionId,
  //     "subscription_mrr": subscriptionMrr,
  //     "pause_start_date": pauseStartDate
  //   })
  // })

  // get latest invoice so we can create a credit note
  const invoice = await new Promise<typeof chargebee.invoice>(
    (accept, reject) => {
      chargebee.invoice
        .list({
          limit: 1,
          subscription_id: { is: subscriptionId },
          status: { in: ["paid", "payment_due"] },
          "sort_by[desc]": "date"
        })
        .request(function (
          error: unknown,
          result: { list: typeof chargebee.invoice[] }
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
  const daysInAMonth = 31; // 365 / 12
  const startDate = DateTime.fromISO(pauseStartDate).startOf('day');
  // const resumeDate = DateTime.now().startOf('day');
  const resumeDate = DateTime.fromISO("2024-04-10T00:00:00.000+00:00");
  const daysPaused = resumeDate.diff(startDate, "days").days;
  const passesFirstOfTheMonth = resumeDate.month !== startDate.month;
  const daysToReimburse = passesFirstOfTheMonth
    ? daysPaused - resumeDate.day - 1
    : daysPaused;
  const dayRate = subscriptionMrr / daysInAMonth;
  const proRataAmount = dayRate * daysToReimburse;
  const currencyProRatedAmount = Math.ceil(proRataAmount);

  console.log({
    passesFirstOfTheMonth,
    daysInAMonth,
    startDate: humanReadableDate(startDate, true),
    resumeDate: humanReadableDate(resumeDate, true),
    dayRate,
    daysPaused,
    daysToReimburse,
    proRataAmount,
    currencyProRatedAmount,
  });

  console.log("crediting amount", `£${currencyProRatedAmount / 100}`);

  // issue credit note
  await new Promise<typeof chargebee.credit_note>(
    (accept, reject) => {
      chargebee.credit_note
        .create({
          reference_invoice_id: (invoice as any).id,
          total: currencyProRatedAmount,
          type: "REFUNDABLE",
          create_reason_code: "OTHER",
          customer_notes: `Subscription ${subscriptionId} paused from ${humanReadableDate(startDate, true)}, resumed on ${humanReadableDate(resumeDate, true)}.`
        })
        .request(function (
          error: unknown,
          result: { credit_note: typeof chargebee.credit_note }
        ) {
          if (error) {
            reject(error);
          } else {
            const credit_note: typeof chargebee.credit_note = result.credit_note;
            accept(credit_note);
          }
        });
    }
  );

  // clear pause date in custom field
  await new Promise<typeof chargebee.subscription>(
    (accept, reject) => {
      chargebee.subscription
        .update_for_items(subscriptionId, {
          cf_Pause_date_ISO: '',
        } as any)
        .request(function (
          error: unknown,
          result: { subscription: typeof chargebee.subscription }
        ) {
          if (error) {
            reject(error);
          } else {
            const subscription: typeof chargebee.subscription = result.subscription;
            accept(subscription);
          }
        });
    }
  );
};