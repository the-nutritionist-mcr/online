import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import "dotenv/config";
import { getChargebeeClient } from "../chargebee/initialise";
import {
  protectRoute,
  returnErrorResponse,
  returnOkResponse,
} from "@tnmo/core-backend";
import { isFeatureEnabled } from "@/constants/env";
import { DateTime } from 'luxon';
import { humanReadableDate } from '@/components/organisms/account/pause-utils';
import { calculatePauseCredit } from '@/backend/utils/calculate-pause-credit';
import {
  findInvoiceContainingDate,
  getInvoiceBilledPeriod,
  getPauseCreditNoteType,
} from '@/backend/utils/select-pause-credit-invoice';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const chargebee = await getChargebeeClient();

  try {
    await protectRoute(event, ["admin"]);
    const payload = JSON.parse(event.body ?? '');

    const startDate = DateTime.fromISO(payload.pause_start_date).startOf('day');
    const resumeDate = isFeatureEnabled("updatedPauseLogic")
      ? DateTime.fromSeconds(payload.resume_date).startOf('day')
      : DateTime.now().startOf('day');

    if (!isFeatureEnabled("updatedPauseLogic")) {
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
                accept((result.list[0] as any).invoice);
              }
            });
        });

      const { totalInCents: currencyProRatedAmount } = calculatePauseCredit({
        pauseStart: startDate,
        resumeDate,
        subscriptionMrr: payload.subscription_mrr,
      });

      if (currencyProRatedAmount <= 0) {
        return returnOkResponse({
          skipped: true,
          reason: "No reimbursable billed days in the pause window.",
        });
      }

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
                accept(subscription);
              }
            });
        }
      );

      return returnOkResponse({
        subscription,
        creditNote,
      });
    }

    // get recent eligible invoices so we can select the billed term to credit
    const invoices = await new Promise<any[]>(
      (accept, reject) => {
        chargebee.invoice
          .list({
            limit: 100,
            subscription_id: { is: payload.subscription_id },
            status: { in: ["paid", "payment_due"] },
            "sort_by[desc]": "date"
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
        `No paid or payment_due invoice found containing pause start date for subscription ${payload.subscription_id}.`
      );
    }

    const resumeInvoice = findInvoiceContainingDate({
      date: resumeDate,
      invoices,
    });

    if ((resumeInvoice as any)?.id === (startInvoice as any).id) {
      return returnOkResponse({
        skipped: true,
        reason: "Pause resumed within the same billed term. Chargebee should handle the in-term proration.",
      });
    }

    const { billedPeriodStart, billedPeriodEnd } = getInvoiceBilledPeriod(startInvoice);
    const { totalInCents: currencyProRatedAmount } = calculatePauseCredit({
      pauseStart: startDate,
      resumeDate,
      subscriptionMrr: payload.subscription_mrr,
      billedPeriodStart,
      billedPeriodEnd,
    });

    if (currencyProRatedAmount <= 0) {
      return returnOkResponse({
        skipped: true,
        reason: "No reimbursable billed days in the pause window.",
      });
    }

    const creditNote = await new Promise<typeof chargebee.credit_note>(
      (accept, reject) => {
        chargebee.credit_note
          .create({
            reference_invoice_id: (startInvoice as any).id,
            total: currencyProRatedAmount,
            type: getPauseCreditNoteType((startInvoice as any).status),
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
