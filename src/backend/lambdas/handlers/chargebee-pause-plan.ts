import "dotenv/config";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { chargebee } from "../chargebee/initialise";
import { DateTime } from "luxon";

import {
  protectRoute,
  returnOkResponse,
  returnErrorResponse,
} from "@tnmo/core-backend";
import { humanReadableDate } from '@/components/organisms/account/pause-utils';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const payload = JSON.parse(event.body ?? '');

    const pausedSubscription = await new Promise<typeof chargebee.subscription>(
      (accept, reject) => {
        chargebee.subscription
          .pause(payload.plan_id, {
            pause_option: "specific_date",
            pause_date: payload.pause_date,
            resume_date: payload.resume_date
          })
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

    // get latest invoice so we can create a credit note
    const invoice = await new Promise<typeof chargebee.invoice>(
      (accept, reject) => {
        chargebee.invoice
          .list({
            limit: 1,
            subscription_id: { is: pausedSubscription.id },
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
              console.log(`result.list[0].invoice: ${result.list[0].invoice}`);
              accept(result.list[0].invoice);
            }
          });
      });

    const averagedDaysInAMonth = 365 / 12;
    const daysPaused = DateTime.fromSeconds(payload.resume_date).diff(DateTime.fromSeconds(payload.pause_date), 'days').days;
    const proRataAmount = (pausedSubscription.mrr / averagedDaysInAMonth) * daysPaused;
    const currencyProRatedAmount = Math.ceil(proRataAmount);

    console.log('averagedDaysInAMonth', averagedDaysInAMonth);
    console.log('daysPaused (diff)', daysPaused);
    console.log('proRataAmount (from mrr)', proRataAmount);
    console.log('crediting invoice id', invoice.id);
    console.log('currencyProRatedAmount', currencyProRatedAmount);
    console.log('crediting pro rata amount', `£${currencyProRatedAmount / 100}`);

    const creditNote = await new Promise<typeof chargebee.credit_note>(
      (accept, reject) => {
        chargebee.credit_note
          .create({
            reference_invoice_id: invoice.id,
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

    console.log('pausedSubscription:', pausedSubscription);
    console.log('creditNote:', creditNote);

    const pausedSubscriptionWithCreditNoteId = await new Promise<typeof chargebee.subscription>(
      (accept, reject) => {
        chargebee.subscription
          .update_for_items(payload.plan_id, {
            cf_Pause_credit_note_ID: creditNote.id,
          })
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
      subscription: pausedSubscriptionWithCreditNoteId,
      invoice: invoice,
      creditNote: creditNote
    }

    return returnOkResponse(responseData)
  } catch (error) {
    return returnErrorResponse(error)
  }
}



// chargebee customer id: "77ECsTyblGXbD2P"
// my plan id: "BTUNdaTybyFUOEi2"
