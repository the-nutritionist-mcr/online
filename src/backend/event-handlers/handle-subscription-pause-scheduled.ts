import { ChargeBee } from "chargebee-typescript";
import { Event } from "chargebee-typescript/lib/resources";
import { DateTime } from "luxon";
import { setPauseDate } from "./subscription-pausing/set-pause-date";

export const handleSubscriptionPauseScheduled = async (
  client: ChargeBee,
  event: Event
) => {
  const { pause_date: pauseDate } = event.content.subscription;

  if (typeof pauseDate !== "number") {
    return;
  }

  await setPauseDate(
    client,
    event.content.subscription.id,
    DateTime.fromSeconds(pauseDate)
  );
};

export const handleSubscriptionPaused = async (
  client: ChargeBee,
  event: Event
) => {
  const { id, pause_date: pauseDate } = event.content.subscription;
  // The event timestamp is stable across retries of an immediate pause.
  await setPauseDate(
    client,
    id,
    DateTime.fromSeconds(
      typeof pauseDate === "number" ? pauseDate : event.occurred_at
    )
  );
};
