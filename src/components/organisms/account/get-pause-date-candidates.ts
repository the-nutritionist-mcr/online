import { DateTime } from "luxon";

const SUNDAY = 7;
const WEDNESDAY = 3;
const MAX_SELECTABLE_DAYS = 8;

export const getPauseDateCandidates = (start: DateTime | null) => {
  const dates: DateTime[] = [];

  if (!start) {
    return [];
  }

  let newDay = DateTime.fromMillis(
    start.startOf("day").plus({ hours: 4 }).toMillis()
  );

  while (dates.length < MAX_SELECTABLE_DAYS) {
    newDay = newDay.plus({ days: 1 });
    if (newDay.weekday === SUNDAY || newDay.weekday === WEDNESDAY) {
      dates.push(newDay);
    }
  }

  return dates;
};
