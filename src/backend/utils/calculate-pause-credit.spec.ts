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

  it("never produces a negative credit when the resume date is later in the same month", () => {
    const pauseStart = DateTime.fromISO("2024-10-11");
    const resumeDate = DateTime.fromISO("2024-10-20");

    expect(getPauseCreditDays(pauseStart, resumeDate)).toBe(9);
    expect(
      calculatePauseCredit({
        pauseStart,
        resumeDate,
        subscriptionMrr: 36166,
      })
    ).toStrictEqual({
      creditDays: 9,
      totalInCents: 10731,
    });
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
