import { ChargeBee } from "chargebee-typescript";
import { DateTime } from "luxon";

export const pauseSubscription = async (
  chargebee: ChargeBee,
  planId: string,
  pauseDate: number,
  resumeDate: number
) => {
  await new Promise<typeof chargebee.subscription>((accept, reject) => {
    chargebee.subscription
      .pause(planId, {
        pause_option: "specific_date",
        pause_date: pauseDate,
        resume_date: resumeDate,
      })
      .request(function (
        error: unknown,
        result: { subscription: typeof chargebee.subscription }
      ) {
        if (error) {
          reject(error);
        } else {
          const subscription: typeof chargebee.subscription =
            result.subscription;
          accept(subscription);
        }
      });
  });

  return await new Promise<typeof chargebee.subscription>((accept, reject) => {
    chargebee.subscription
      .update_for_items(planId, {
        cf_Pause_date_ISO: DateTime.fromSeconds(pauseDate).toISO(),
      } as any)
      .request(function (
        error: unknown,
        result: { subscription: typeof chargebee.subscription }
      ) {
        if (error) {
          reject(error);
        } else {
          const subscription: typeof chargebee.subscription =
            result.subscription;
          accept(subscription);
        }
      });
  });
};
