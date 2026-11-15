import { Event } from "chargebee-typescript/lib/resources";
import { DateTime } from "luxon";
import { UK_COOK_ZONE } from "@/meal-planning/uk-cook-date";

export const getPauseDate = (event: Event) => {
  const { cf_Pause_date_ISO: pausedAtIso } = event.content
    .subscription as unknown as {
    cf_Pause_date_ISO?: string;
  };

  // Some historical Chargebee values use lowercase ISO separators.
  const iso = typeof pausedAtIso === "string" ? pausedAtIso.toUpperCase() : "";
  return DateTime.fromISO(iso, { zone: UK_COOK_ZONE });
};
