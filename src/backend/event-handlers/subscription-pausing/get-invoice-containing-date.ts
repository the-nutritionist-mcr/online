import { ChargeBee } from "chargebee-typescript";
import { Invoice } from "chargebee-typescript/lib/resources";
import { DateTime } from "luxon";

export const getInvoiceContainingDate = async (
  client: ChargeBee,
  subscriptionId: string,
  date: DateTime
): Promise<Invoice> => {
  let offset: string | undefined;

  do {
    const result = await new Promise<{
      list: Array<{ invoice: Invoice }>;
      next_offset?: string;
    }>((resolve, reject) => {
      client.invoice
        .list({
          limit: 2,
          offset,
          subscription_id: { is: subscriptionId },
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

    const invoice = result.list
      .map(({ invoice }) => invoice)
      .find(
        (candidate) =>
          candidate.date &&
          DateTime.fromSeconds(candidate.date).hasSame(date, "month")
      );

    if (invoice) {
      return invoice;
    }

    offset = result.next_offset;
  } while (offset);

  throw new Error(
    `No invoice found for subscription ${subscriptionId} containing ${date.toISO()}.`
  );
};
