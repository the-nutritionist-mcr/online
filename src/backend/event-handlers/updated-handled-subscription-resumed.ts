import { ChargeBee } from "chargebee-typescript";
import { Event } from "chargebee-typescript/lib/resources";
import { getRelevantInvoices } from "./subscription-pausing/get-invoice-containing-date";
import { DateTime } from "luxon";
import { getPauseDate } from "./subscription-pausing/get-pause-date";
import { setPauseDate } from "./subscription-pausing/set-pause-date";
import { calculateSubscriptionTotal } from "./subscription-pausing/calculate-subscription-total";
import { calculateCreditAmountsFromCookDays } from "./subscription-pausing/calculate-credit-amounts-from-cook-days";
import { creditInvoice } from "./subscription-pausing/credit-invoices";

const serialiseDate = (date: DateTime) =>
  date.isValid ? date.toISO() : `Invalid date: ${date.invalidReason}`;

export const updatedHandledSubscriptionResumed = async (
  client: ChargeBee,
  event: Event
) => {
  if (event.content.customer.email !== "bwainwright28@gmail.com") {
    return;
  }
  const subscriptionId = event.content.subscription.id;

  try {
    console.log("Starting resumed subscription post-processing", {
      eventId: event.id,
      customerId: event.content.customer.id,
      customerEmail: event.content.customer.email,
      subscriptionId,
      occurredAt: event.occurred_at,
    });

    const subscriptionMrr = calculateSubscriptionTotal(
      event.content.subscription
    );

    console.log("Calculated resumed subscription total", {
      eventId: event.id,
      subscriptionId,
      subscriptionMrr,
    });

    const pauseStart = getPauseDate(event);
    const resumeDate = DateTime.fromSeconds(event.occurred_at);

    console.log("Resolved resumed subscription pause dates", {
      eventId: event.id,
      subscriptionId,
      // Chargebee clears pause_date before subscription_resumed is delivered.
      rawPauseDate: (event.content.subscription as any).cf_Pause_date_ISO,
      pauseStart: serialiseDate(pauseStart),
      resumeDate: serialiseDate(resumeDate),
    });

    if (!pauseStart.isValid) {
      throw new Error(
        `Invalid subscription pause date for subscription ${subscriptionId}: ${pauseStart.invalidReason}`
      );
    }

    if (!resumeDate.isValid) {
      throw new Error(
        `Invalid subscription resume date for subscription ${subscriptionId}: ${resumeDate.invalidReason}`
      );
    }

    if (!subscriptionMrr) {
      console.log("Skipping resumed subscription credit because MRR is zero", {
        eventId: event.id,
        subscriptionId,
      });
      return;
    }

    console.log("Fetching invoices relevant to resumed subscription pause", {
      eventId: event.id,
      subscriptionId,
      pauseStart: pauseStart.toISO(),
      resumeDate: resumeDate.toISO(),
    });

    const invoices = await getRelevantInvoices(
      client,
      subscriptionId,
      pauseStart,
      resumeDate
    );

    console.log("Fetched invoices relevant to resumed subscription pause", {
      eventId: event.id,
      subscriptionId,
      invoiceCount: invoices.length,
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        date: invoice.date,
        status: invoice.status,
        total: invoice.total,
        lineItemPeriods: invoice.line_items?.map((lineItem) => ({
          dateFrom: lineItem.date_from,
          dateTo: lineItem.date_to,
        })),
      })),
    });

    const amounts = calculateCreditAmountsFromCookDays({
      pauseStart,
      resumeDate,
      invoices,
      subscriptionMrr,
    });

    console.log("Calculated resumed subscription credit amounts", {
      eventId: event.id,
      subscriptionId,
      creditCount: amounts.size,
      credits: [...amounts.entries()].map(([invoiceId, invoiceAmounts]) => ({
        invoiceId,
        credit: invoiceAmounts.credit,
        dates: invoiceAmounts.dates.map((date) => date.toISODate()),
      })),
    });

    for (const [invoiceId, invoiceAmounts] of amounts) {
      const invoice = invoices.find((invoice) => invoice.id === invoiceId);
      if (invoice) {
        console.log("Creating pause credit note for resumed subscription", {
          eventId: event.id,
          subscriptionId,
          invoiceId,
          credit: invoiceAmounts.credit,
          missedCookDays: invoiceAmounts.dates.map((date) => date.toISODate()),
        });

        await creditInvoice(client, {
          pauseStart,
          resumeDate,
          invoice,
          missedCookDays: invoiceAmounts,
        });

        console.log("Created pause credit note for resumed subscription", {
          eventId: event.id,
          subscriptionId,
          invoiceId,
        });
      }
    }

    console.log("Clearing stored subscription pause date", {
      eventId: event.id,
      subscriptionId,
    });

    await setPauseDate(client, subscriptionId, null);

    console.log("Cleared stored subscription pause date", {
      eventId: event.id,
      subscriptionId,
    });
  } catch (error) {
    console.error("Failed resumed subscription post-processing", {
      eventId: event.id,
      customerId: event.content.customer.id,
      customerEmail: event.content.customer.email,
      subscriptionId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};
