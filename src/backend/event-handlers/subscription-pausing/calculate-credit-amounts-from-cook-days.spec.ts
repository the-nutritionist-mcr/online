import { DateTime } from "luxon";
import { Invoice } from "chargebee-typescript/lib/resources";
import { calculateCreditAmountsFromCookDays } from "./calculate-credit-amounts-from-cook-days";

const invoice = (
  id: string,
  dateFrom: string,
  dateTo: string
): Invoice =>
  ({
    id,
    line_items: [
      {
        date_from: DateTime.fromISO(dateFrom).toUnixInteger(),
        date_to: DateTime.fromISO(dateTo).toUnixInteger(),
      },
    ],
  }) as Invoice;

describe("calculateCreditAmountsFromCookDays", () => {
  it("rounds credit amounts up to whole pence", () => {
    const credits = calculateCreditAmountsFromCookDays({
      pauseStart: DateTime.fromISO("2026-06-01"),
      resumeDate: DateTime.fromISO("2026-06-04"),
      subscriptionMrr: 50000,
      invoices: [
        invoice(
          "invoice-id",
          "2026-06-01T00:00:00.000+01:00",
          "2026-07-01T00:00:00.000+01:00"
        ),
      ],
    });

    const credit = credits.get("invoice-id");

    if (!credit) {
      throw new Error("Expected invoice-id to have a credit");
    }

    expect(credit.credit).toBe(5770);
    expect(credit.dates.map((date) => date.toISO())).toEqual([
      DateTime.fromISO("2026-06-03").plus({ hours: 4 }).toISO(),
    ]);
  });

  it("credits missed cook days to the invoices covering those dates", () => {
    const credits = calculateCreditAmountsFromCookDays({
      pauseStart: DateTime.fromISO("2026-05-23T23:00:00.000+00:00"),
      resumeDate: DateTime.fromISO("2026-06-06T23:02:36.000+00:00"),
      subscriptionMrr: 50000,
      invoices: [
        invoice(
          "june-invoice",
          "2026-06-01T00:00:00.000+01:00",
          "2026-07-01T00:00:00.000+01:00"
        ),
        invoice(
          "may-invoice",
          "2026-05-01T00:00:00.000+01:00",
          "2026-06-01T00:00:00.000+01:00"
        ),
      ],
    });

    expect(credits.get("may-invoice")?.credit).toBe(17308);
    expect(
      credits.get("may-invoice")?.dates.map((date) => date.toISODate())
    ).toEqual(["2026-05-24", "2026-05-27", "2026-05-31"]);
    expect(credits.get("june-invoice")?.credit).toBe(5770);
    expect(
      credits.get("june-invoice")?.dates.map((date) => date.toISODate())
    ).toEqual(["2026-06-03"]);
  });

  it("credits unmatched cook days to the latest invoice", () => {
    const credits = calculateCreditAmountsFromCookDays({
      pauseStart: DateTime.fromISO("2026-05-23T23:00:00.000+00:00"),
      resumeDate: DateTime.fromISO("2026-06-06T23:02:36.000+00:00"),
      subscriptionMrr: 50000,
      invoices: [
        invoice(
          "june-invoice",
          "2026-06-07T00:00:00.000+01:00",
          "2026-07-01T00:00:00.000+01:00"
        ),
        invoice(
          "may-invoice",
          "2026-05-01T00:00:00.000+01:00",
          "2026-06-01T00:00:00.000+01:00"
        ),
      ],
    });

    expect(credits.get("may-invoice")?.credit).toBe(17308);
    expect(
      credits.get("may-invoice")?.dates.map((date) => date.toISODate())
    ).toEqual(["2026-05-24", "2026-05-27", "2026-05-31"]);
    expect(credits.get("june-invoice")?.credit).toBe(5770);
    expect(
      credits.get("june-invoice")?.dates.map((date) => date.toISODate())
    ).toEqual(["2026-06-03"]);
  });
});
