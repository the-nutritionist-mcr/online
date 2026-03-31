import { DateTime } from "luxon";
import { calculatePauseCredit, getPauseCreditDays } from "./calculate-pause-credit";

describe("calculatePauseCredit", () => {
  describe("getPauseCreditDays", () => {
    it("normalizes time-of-day values to whole days", () => {
      expect(
        getPauseCreditDays(
          DateTime.fromISO("2024-07-12T23:59:00"),
          DateTime.fromISO("2024-07-13T00:01:00")
        )
      ).toBe(1);
    });

    it("clamps the credited days to the billed period overlap", () => {
      expect(
        getPauseCreditDays(
          DateTime.fromISO("2024-02-20"),
          DateTime.fromISO("2024-03-03"),
          DateTime.fromISO("2024-02-26"),
          DateTime.fromISO("2024-03-26")
        )
      ).toBe(6);
    });

    it("clamps the credited days when the resume date falls after the billed period", () => {
      expect(
        getPauseCreditDays(
          DateTime.fromISO("2024-03-20"),
          DateTime.fromISO("2024-03-30"),
          DateTime.fromISO("2024-02-26"),
          DateTime.fromISO("2024-03-26")
        )
      ).toBe(6);
    });

    it("returns zero when the resume date is not after the pause start", () => {
      expect(
        getPauseCreditDays(
          DateTime.fromISO("2024-11-03"),
          DateTime.fromISO("2024-11-03")
        )
      ).toBe(0);
    });
  });

  describe("calculatePauseCredit", () => {
    it("returns zero amount when mrr is zero", () => {
      expect(
        calculatePauseCredit({
          pauseStart: DateTime.fromISO("2024-07-12"),
          resumeDate: DateTime.fromISO("2024-07-13"),
          subscriptionMrr: 0,
        })
      ).toStrictEqual({
        creditDays: 1,
        totalInCents: 0,
      });
    });
  });
});
