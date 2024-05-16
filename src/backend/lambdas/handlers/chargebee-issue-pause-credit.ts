import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import "dotenv/config";
import { chargebee } from "../chargebee/initialise";
import {
  protectRoute,
  returnErrorResponse,
  returnOkResponse,
} from "@tnmo/core-backend";
import { DateTime } from 'luxon';
import { humanReadableDate } from '@/components/organisms/account/pause-utils';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const payload = JSON.parse(event.body ?? '');

    // get latest invoice so we can create a credit note
    const invoice = await new Promise<typeof chargebee.invoice>(
      (accept, reject) => {
        chargebee.invoice
          .list({
            limit: 1,
            subscription_id: { is: payload.subscription_id },
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
              console.log(`result.list[0].invoice: ${(result.list[0] as any).invoice}`);
              accept((result.list[0] as any).invoice);
            }
          });
      });

    // calculate credit for paused period already billed (up to 1st of this month)
    const daysInAMonth = 31; // 365 / 12
    const startDate = DateTime.fromISO(payload.pause_start_date).startOf('day');
    const resumeDate = DateTime.now().startOf('day');
    const daysPaused = resumeDate.diff(startDate, "days").days;
    const passesFirstOfTheMonth = resumeDate.month !== startDate.month;
    const daysToReimburse = passesFirstOfTheMonth
      ? daysPaused - resumeDate.day - 1
      : daysPaused;
    const dayRate = payload.subscription_mrr / daysInAMonth;
    const proRataAmount = dayRate * daysToReimburse;
    const currencyProRatedAmount = Math.ceil(proRataAmount);

    console.log("passesFirstOfTheMonth", passesFirstOfTheMonth);
    console.log("daysInAMonth", daysInAMonth);
    console.log("dayRate", dayRate);
    console.log("daysPaused", daysPaused);
    console.log("daysToReimburse", daysToReimburse);
    console.log("proRataAmount (from mrr)", proRataAmount);
    console.log("currencyProRatedAmount", currencyProRatedAmount);
    console.log("crediting amount", `£${currencyProRatedAmount / 100}`);

    const creditNote = await new Promise<typeof chargebee.credit_note>(
      (accept, reject) => {
        chargebee.credit_note
          .create({
            reference_invoice_id: (invoice as any).id,
            total: currencyProRatedAmount,
            type: "REFUNDABLE",
            create_reason_code: "OTHER",
            customer_notes: `Subscription paused from ${humanReadableDate(DateTime.fromSeconds(payload.pause_date), true)} to ${humanReadableDate(DateTime.fromSeconds(payload.resume_date), true)}.`
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

    console.log('creditNote:', creditNote);

    // clear pause date in custom field
    const subscription = await new Promise<typeof chargebee.subscription>(
      (accept, reject) => {
        chargebee.subscription
          .update_for_items(payload.subscription_id, {
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
              console.log(`subscription: ${result}`);
              accept(subscription);
            }
          });
      }
    );

    const responseData = {
      subscription: subscription,
      creditNote: creditNote
    }

    return returnOkResponse(responseData)
  } catch (error) {
    return returnErrorResponse(error)
  }
}