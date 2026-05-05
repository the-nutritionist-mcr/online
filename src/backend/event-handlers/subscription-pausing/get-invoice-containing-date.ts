import { ChargeBee } from "chargebee-typescript";
import { Invoice } from "chargebee-typescript/lib/resources";
import { DateTime, Interval } from "luxon";

const getInvoices = async (client: ChargeBee, subscriptionId: string) => {
  const invoices: Invoice[] = [];
  let offset: string | undefined;
  do {
    const result = await new Promise<{
      list: Array<{ invoice: Invoice }>;
      next_offset?: string;
    }>((resolve, reject) => {
      client.invoice
        .list({
          limit: 3,
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
  } while (offset);
  return invoices;
};

export const getRelevantInvoices = async (
  client: ChargeBee,
  subscriptionId: string,
  startDate: DateTime,
  endDate: DateTime
): Promise<Invoice[]> => {
  const invoices = await getInvoices(client, subscriptionId);

  return invoices.filter((invoice) => {
    if (!invoice.date) {
      return false;
    }

    if (DateTime.fromSeconds(invoice.date).hasSame(startDate, "month")) {
      return true;
    }

    if (DateTime.fromSeconds(invoice.date).hasSame(endDate, "month")) {
      return true;
    }

    const range = Interval.fromDateTimes(startDate, endDate);

    if (range.contains(DateTime.fromSeconds(invoice.date))) {
      return true;
    }

    return false;
  });
};
