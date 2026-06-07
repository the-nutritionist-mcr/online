import { DateTime } from "luxon";
import { Invoice } from "chargebee-typescript/lib/resources";
import { calculateCreditAmountsFromCookDays } from "./calculate-credit-amounts-from-cook-days";

describe("calculateCreditAmountsFromCookDays", () => {
  it("rounds credit amounts up to whole pence", () => {
    const invoice = {
      id: "invoice-id",
      date: DateTime.fromISO("2026-06-01").toUnixInteger(),
    } as Invoice;

    const credits = calculateCreditAmountsFromCookDays({
      pauseStart: DateTime.fromISO("2026-06-01"),
      resumeDate: DateTime.fromISO("2026-06-04"),
      invoices: [invoice],
      subscriptionMrr: 50000,
    });

    const credit = credits.get("invoice-id");

    expect(credit?.credit).toBe(11539);
    expect(credit?.dates.map((date) => date.toISO())).toEqual([
      DateTime.fromISO("2026-06-03").plus({ hours: 4 }).toISO(),
    ]);
  });
});
