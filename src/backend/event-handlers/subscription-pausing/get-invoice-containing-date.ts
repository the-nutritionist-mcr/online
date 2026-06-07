import { ChargeBee } from "chargebee-typescript";
import { Invoice } from "chargebee-typescript/lib/resources";
import { DateTime, Interval } from "luxon";

const getInvoices = async (client: ChargeBee, subscriptionId: string) => {
  const invoices: Invoice[] = [];
  let offset: string | undefined;
  let page = 1;
  do {
    console.log("Fetching Chargebee invoice page", {
      subscriptionId,
      page,
      offset,
    });

    const result = await new Promise<{
      list: Array<{ invoice: Invoice }>;
      next_offset?: string;
    }>((resolve, reject) => {
      client.invoice
        .list({
          limit: 100,
          offset,
          subscription_id: { is: subscriptionId },
          status: { in: ["posted", "not_paid", "payment_due", "paid"] },
          "sort_by[desc]": "date",
        })
        .request(
          (
            error: unknown,
            listResult: {
              list: Array<{ invoice: Invoice }>;
              next_offset?: string;
            }
          ) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(listResult);
          }
        );
    });

    offset = result.next_offset;
    invoices.push(...result.list.map((item) => item.invoice));
    console.log("Fetched Chargebee invoice page", {
      subscriptionId,
      page,
      invoiceCount: result.list.length,
      totalInvoiceCount: invoices.length,
      hasNextPage: Boolean(offset),
    });
    page += 1;
  } while (offset);
  return invoices;
};

export const getLatestInvoice = async (
  client: ChargeBee,
  subscriptionId: string
): Promise<Invoice | null> => {
  const invoices = await getInvoices(client, subscriptionId);
  return invoices[0] ?? null;
};

export const getRelevantInvoices = async (
  client: ChargeBee,
  subscriptionId: string,
  startDate: DateTime,
  endDate: DateTime
): Promise<Invoice[]> => {
  const invoices = await getInvoices(client, subscriptionId);

  return invoices.filter((invoice) => {
    const pauseRange = Interval.fromDateTimes(startDate, endDate);

    return invoice.line_items?.some((lineItem) => {
      if (!lineItem.date_from || !lineItem.date_to) {
        return false;
      }

      return pauseRange.overlaps(
        Interval.fromDateTimes(
          DateTime.fromSeconds(lineItem.date_from),
          DateTime.fromSeconds(lineItem.date_to)
        )
      );
    });
  });
};
