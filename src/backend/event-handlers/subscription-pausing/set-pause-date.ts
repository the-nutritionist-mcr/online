import { ChargeBee } from "chargebee-typescript";
import { DateTime } from "luxon";

export const setPauseDate = async (
  client: ChargeBee,
  subscriptionId: string,
  date: DateTime | null
) => {
  await new Promise<typeof client.subscription>((accept, reject) => {
    client.subscription
      .update_for_items(subscriptionId, {
        cf_Pause_date_ISO: date?.toISO() ?? "",
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
  });
};
