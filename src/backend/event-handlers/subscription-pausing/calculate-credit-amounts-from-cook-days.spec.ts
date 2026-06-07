import { DateTime } from "luxon";
import { calculateCreditAmountsFromCookDays } from "./calculate-credit-amounts-from-cook-days";

describe("calculateCreditAmountsFromCookDays", () => {
  it("rounds credit amounts up to whole pence", () => {
    const credit = calculateCreditAmountsFromCookDays({
      pauseStart: DateTime.fromISO("2026-06-01"),
      resumeDate: DateTime.fromISO("2026-06-04"),
      subscriptionMrr: 50000,
    });

    expect(credit.credit).toBe(11539);
    expect(credit.dates.map((date) => date.toISO())).toEqual([
      DateTime.fromISO("2026-06-03").plus({ hours: 4 }).toISO(),
    ]);
  });

  it("credits all missed cook days across month boundaries", () => {
    const credit = calculateCreditAmountsFromCookDays({
      pauseStart: DateTime.fromISO("2026-05-23T23:00:00.000+00:00"),
      resumeDate: DateTime.fromISO("2026-06-06T23:02:36.000+00:00"),
      subscriptionMrr: 50000,
    });

    expect(credit.credit).toBe(46154);
    expect(credit.dates.map((date) => date.toISODate())).toEqual([
      "2026-05-24",
      "2026-05-27",
      "2026-05-31",
      "2026-06-03",
    ]);
  });
});
