import { DateTime } from "luxon";
import { Invoice } from "chargebee-typescript/lib/resources";
import { mock } from "vitest-mock-extended";
import { StandardPlan } from "@tnmo/types";
import { getCookStatus } from "@/meal-planning/get-cook-status";
import { UK_COOK_ZONE } from "@/meal-planning/uk-cook-date";
import { calculateCreditAmountsFromCookDays } from "./calculate-credit-amounts-from-cook-days";

const invoice = (id: string, dateFrom: string, dateTo: string): Invoice =>
  ({
    id,
    line_items: [
      {
        date_from: DateTime.fromISO(dateFrom).toUnixInteger(),
        date_to: DateTime.fromISO(dateTo).toUnixInteger(),
      },
    ],
  } as Invoice);

describe("calculateCreditAmountsFromCookDays", () => {
  const juneInvoiceEnd = "2026-07-01T00:00:00.000+01:00";
  const juneStart = "2026-06-01T00:00:00.000+01:00";
  const mayInvoice = invoice(
    "may-invoice",
    "2026-05-01T00:00:00.000+01:00",
    juneStart
  );
  const expectedAcrossInvoices = [
    {
      invoiceId: "may-invoice",
      credit: 17308,
      dates: ["2026-05-24", "2026-05-27", "2026-05-31"],
    },
    { invoiceId: "june-invoice", credit: 5770, dates: ["2026-06-03"] },
  ];

  const juneInvoice = invoice("june-invoice", juneStart, juneInvoiceEnd);
  const laterJuneInvoice = invoice(
    "june-invoice",
    "2026-06-07T00:00:00.000+01:00",
    juneInvoiceEnd
  );
  const expectedRoundedCredit = [
    {
      invoiceId: "invoice-id",
      credit: 5770,
      dates: ["2026-06-03T04:00:00.000+01:00"],
    },
  ];
  const mayPauseStart = "2026-05-23T23:00:00.000+00:00";
  const juneResumeDate = "2026-06-06T23:02:36.000+00:00";

  it.each`
    name                                                                   | pauseStart       | resumeDate        | invoices                                              | includeTime | expected
    ${"rounds credit amounts up to whole pence"}                           | ${"2026-06-01"}  | ${"2026-06-04"}   | ${[invoice("invoice-id", juneStart, juneInvoiceEnd)]} | ${true}     | ${expectedRoundedCredit}
    ${"credits missed cook days to the invoices covering those dates"}     | ${mayPauseStart} | ${juneResumeDate} | ${[juneInvoice, mayInvoice]}                          | ${false}    | ${expectedAcrossInvoices}
    ${"offsets unbilled June cook credit when billing restarts on resume"} | ${mayPauseStart} | ${juneResumeDate} | ${[laterJuneInvoice, mayInvoice]}                     | ${false}    | ${expectedAcrossInvoices.slice(0, 1)}
  `("$name", ({ pauseStart, resumeDate, invoices, includeTime, expected }) => {
    const credits = calculateCreditAmountsFromCookDays({
      pauseStart: DateTime.fromISO(pauseStart),
      resumeDate: DateTime.fromISO(resumeDate),
      subscriptionMrr: 50000,
      invoices,
    });

    expect(credits.size).toBe(expected.length);
    for (const { invoiceId, credit, dates } of expected) {
      const actual = credits.get(invoiceId);
      expect(actual?.credit).toBe(credit);
      expect(
        actual?.dates.map((date) =>
          includeTime ? date.toISO() : date.toISODate()
        )
      ).toEqual(dates);
    }
  });

  const decemberInvoice = invoice(
    "december",
    "2025-12-01T00:00:00Z",
    "2026-01-01T00:00:00Z"
  );
  const januaryInvoice = invoice(
    "january",
    "2026-01-12T00:00:00Z",
    "2026-02-01T00:00:00Z"
  );

  it.each`
    scenario                                      | invoices
    ${"the resumed invoice is available"}         | ${[januaryInvoice, decemberInvoice]}
    ${"the resumed invoice has not appeared yet"} | ${[decemberInvoice]}
  `("keeps December credit when $scenario", ({ invoices }) => {
    const credits = calculateCreditAmountsFromCookDays({
      pauseStart: DateTime.fromISO("2025-12-15T00:00:00Z"),
      resumeDate: DateTime.fromISO("2026-01-12T00:03:00Z"),
      subscriptionMrr: 36166,
      invoices,
    });

    // January's 11 excluded days are worth £128.33, offsetting its £125.19
    // of missed-cook credit. December's five billed cooks still get credited.
    expect(
      [...credits].map(([id, { credit, dates }]) => [id, credit, dates.length])
    ).toEqual([["december", 20865, 5]]);
  });

  it.each`
    scenario                    | pauseTimestamp            | resumeTimestamp           | firstCook       | firstCookBack
    ${"November 04:00 cutoffs"} | ${"2026-11-25T04:00:00Z"} | ${"2026-11-29T04:00:00Z"} | ${"2026-11-25"} | ${"2026-11-29"}
    ${"UK midnight during BST"} | ${"2026-05-23T23:00:00Z"} | ${"2026-05-26T23:02:36Z"} | ${"2026-05-24"} | ${"2026-05-27"}
  `(
    "skips and credits the same cook dates for $scenario",
    ({ pauseTimestamp, resumeTimestamp, firstCook, firstCookBack }) => {
      const pauseStart = DateTime.fromISO(pauseTimestamp);
      const resumeDate = DateTime.fromISO(resumeTimestamp);
      const plan = mock<StandardPlan>({
        pauseStart: pauseStart.toMillis(),
        pauseEnd: resumeDate.toMillis(),
        subscriptionStatus: "active",
      });
      const cookDates = [firstCook, firstCookBack];
      const skippedDates = cookDates.filter((date) => {
        const cook = DateTime.fromISO(date, { zone: UK_COOK_ZONE });
        return getCookStatus(cook.toJSDate(), plan).status === "paused";
      });
      const credits = calculateCreditAmountsFromCookDays({
        pauseStart,
        resumeDate,
        subscriptionMrr: 36166,
        invoices: [
          invoice("invoice-id", "2026-01-01T00:00:00Z", "2027-01-01T00:00:00Z"),
        ],
      });

      expect(skippedDates).toEqual([firstCook]);
      expect(
        credits.get("invoice-id")?.dates.map((date) => date.toISODate())
      ).toEqual(skippedDates);
    }
  );
});
