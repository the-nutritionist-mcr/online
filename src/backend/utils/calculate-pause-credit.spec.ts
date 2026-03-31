import { DateTime } from "luxon";
import { calculatePauseCredit, getPauseCreditDays } from "./calculate-pause-credit";

describe("calculatePauseCredit", () => {
  it("credits the full paused period when the pause stays within one month", () => {
    const pauseStart = DateTime.fromISO("2024-07-12");
    const resumeDate = DateTime.fromISO("2024-07-23");

    expect(getPauseCreditDays(pauseStart, resumeDate)).toBe(11);
    expect(
      calculatePauseCredit({
        pauseStart,
        resumeDate,
        subscriptionMrr: 36166,
      })
    ).toStrictEqual({
      creditDays: 11,
      totalInCents: 13116,
    });
  });

  it("only credits the billed portion when a pause crosses a month boundary", () => {
    const pauseStart = DateTime.fromISO("2024-10-25");
    const resumeDate = DateTime.fromISO("2024-11-01");

    expect(getPauseCreditDays(pauseStart, resumeDate)).toBe(7);
    expect(
      calculatePauseCredit({
        pauseStart,
        resumeDate,
        subscriptionMrr: 36166,
      })
    ).toStrictEqual({
      creditDays: 7,
      totalInCents: 8346,
    });
  });

  it("uses the same weekly-derived daily rate regardless of month length", () => {
    expect(
      calculatePauseCredit({
        pauseStart: DateTime.fromISO("2024-02-01"),
        resumeDate: DateTime.fromISO("2024-02-08"),
        subscriptionMrr: 36166,
      }).totalInCents
    ).toBe(8346);

    expect(
      calculatePauseCredit({
        pauseStart: DateTime.fromISO("2024-03-01"),
        resumeDate: DateTime.fromISO("2024-03-08"),
        subscriptionMrr: 36166,
      }).totalInCents
    ).toBe(8346);
  });

  it("returns zero when there is nothing to credit", () => {
    const pauseStart = DateTime.fromISO("2024-11-03");
    const resumeDate = DateTime.fromISO("2024-11-03");

    expect(
      calculatePauseCredit({
        pauseStart,
        resumeDate,
        subscriptionMrr: 36166,
      })
    ).toStrictEqual({
      creditDays: 0,
      totalInCents: 0,
    });
  });
});
