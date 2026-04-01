import { Event } from "chargebee-typescript/lib/resources";
import { DateTime } from "luxon";

export const getPauseDate = (event: Event) => {
  const { cf_Pause_date_ISO: pausedAtIso } = event.content
    .subscription as (typeof event)["content"]["subscription"] & {
    cf_Pause_date_ISO: string;
  };

  return DateTime.fromISO(pausedAtIso);
};
