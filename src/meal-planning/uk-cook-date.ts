import { DateTime } from "luxon";

export const UK_COOK_ZONE = "Europe/London";

export const startOfUkCookDate = (date: DateTime) =>
  date.setZone(UK_COOK_ZONE).startOf("day");
