import { DateTime } from "luxon";
import { calculatePauseCredit } from "./calculate-pause-credit";

describe("calculatePauseCredit", () => {
  it.each`
    name                                                                       | pauseStart      | resumeDate      | creditDays | totalInCents
    ${"credits the full paused period when the pause stays within one month"}  | ${"2024-07-12"} | ${"2024-07-23"} | ${11}      | ${13116}
    ${"only credits the billed portion when a pause crosses a month boundary"} | ${"2024-10-25"} | ${"2024-11-01"} | ${7}       | ${8346}
    ${"uses the weekly-derived daily rate in February"}                        | ${"2024-02-01"} | ${"2024-02-08"} | ${7}       | ${8346}
    ${"uses the same weekly-derived daily rate in March"}                      | ${"2024-03-01"} | ${"2024-03-08"} | ${7}       | ${8346}
    ${"returns zero when there is nothing to credit"}                          | ${"2024-11-03"} | ${"2024-11-03"} | ${0}       | ${0}
  `("$name", ({ pauseStart, resumeDate, creditDays, totalInCents }) => {
    expect(
      calculatePauseCredit({
        pauseStart: DateTime.fromISO(pauseStart),
        resumeDate: DateTime.fromISO(resumeDate),
        subscriptionMrr: 36166,
      })
    ).toStrictEqual({ creditDays, totalInCents });
  });
});
