import { ChargeBee } from "chargebee-typescript";
import { Event } from "chargebee-typescript/lib/resources";
import { setPauseDate } from "./subscription-pausing/set-pause-date";

export const handleSubscriptionScheduledPauseRemoved = async (
  client: ChargeBee,
  event: Event
) => {
  await setPauseDate(client, event.content.subscription.id, null);
};
