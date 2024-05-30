import { humanReadableDate } from '@/components/organisms/account/pause-utils';
import { ChargeBee } from "chargebee-typescript";
import { DateTime } from 'luxon';
import { handleSubscriptionEvent } from './handle-subscription-event';

export const handleSubscriptionResumed = async (
  client: ChargeBee,
  customerId: string,
  subscriptionId: string,
  subscriptionMrr: number,
  pauseStartDate: string
) => {
  await handleSubscriptionEvent(client, customerId);

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
        .request(function (
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
  const daysInMonth = startDate.daysInMonth ?? 31;

  const resumeDate = DateTime.now().startOf('day');
  // const resumeDate = DateTime.fromISO("2023-07-05T00:00:00.000+00:00");
  // ^^^ use when testing in chargebee's time machine (when today is no longer DateTime.now())

  const daysPaused = resumeDate.diff(startDate, "days").days;
  const passesFirstOfTheMonth = resumeDate.month !== startDate.month;
  const daysToReimburse = passesFirstOfTheMonth
    ? daysPaused - resumeDate.day - 1
    : daysPaused;
  const dayRate = subscriptionMrr / daysInMonth;
  const proRataAmount = dayRate * daysToReimburse;
  const currencyProRatedAmount = Math.ceil(proRataAmount);

  // console.log({
  //   passesFirstOfTheMonth,
  //   daysInMonth,
  //   startDate: humanReadableDate(startDate, true),
  //   resumeDate: humanReadableDate(resumeDate, true),
  //   dayRate,
  //   daysPaused,
  //   daysToReimburse,
  //   proRataAmount,
  //   currencyProRatedAmount,
  // });

  // console.log("crediting amount", `£${currencyProRatedAmount / 100}`);

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
    }
  );

  // clear pause date in custom field
  await new Promise<typeof client.subscription>(
    (accept, reject) => {
      client.subscription
        .update_for_items(subscriptionId, {
          cf_Pause_date_ISO: '',
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
    }
  );
};