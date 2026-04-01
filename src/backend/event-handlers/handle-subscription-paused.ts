import { ChargeBee } from "chargebee-typescript";
import { Event } from "chargebee-typescript/lib/resources";
import { setPauseDate } from "./subscription-pausing/set-pause-date";
import { DateTime } from "luxon";

export const handleSubscriptionPaused = async (
  client: ChargeBee,
  event: Event
) => {
  const pauseStartDate = DateTime.fromSeconds(event.occurred_at);
  await setPauseDate(client, event.content.subscription.id, pauseStartDate);
};
