import { readFileSync } from "node:fs";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { ChargeBee } from "chargebee-typescript";
import type { Subscription } from "chargebee-typescript/lib/resources";
import { Settings } from "luxon";
import { mock } from "vitest-mock-extended";
import { ENV } from "@tnmo/constants";
import { getSecrets } from "@tnmo/core-backend";
import { calculateSubscriptionTotal } from "../../event-handlers/subscription-pausing/calculate-subscription-total";
import { handler } from "./webhook";
import { reloadCustomerPlans } from "../../utils/reload-customer-plans";

vi.mock("../../utils/init-dd-trace", () => ({
  setErrorOnServiceEntrySpan: vi.fn(),
}));
vi.mock("../../utils/reload-customer-plans");
vi.mock("@tnmo/core-backend", async () => ({
  ...(await vi.importActual<typeof import("@tnmo/core-backend")>(
    "@tnmo/core-backend"
  )),
  getSecrets: vi.fn(),
}));

interface HistoricalEvent {
  id: string;
  event_type: string;
  occurred_at: number;
  content: {
    customer: {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
    };
    subscription: Subscription;
  };
}

interface HistoricalInvoice {
  id: string;
  subscription_id?: string;
  date: number;
  generated_at?: number;
}

interface HistoricalRecords {
  events: HistoricalEvent[];
  invoices: HistoricalInvoice[];
}

// Anonymised Chargebee events and invoices used for offline replay.
const fixturePath = new URL("./fixtures/resume-credit.json", import.meta.url);
const records: HistoricalRecords = JSON.parse(
  readFileSync(fixturePath, "utf8")
);

const pounds = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const historicalResume = (eventId: string) => {
  const event = records.events.find(({ id }) => id === eventId);
  const customer = event?.content.customer;
  const customerName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ");
  const monthlyPrice =
    event && calculateSubscriptionTotal(event.content.subscription);

  return {
    eventId,
    customerName: customerName || customer?.id || "Customer unavailable",
    event,
    mrr:
      monthlyPrice === undefined
        ? "unavailable"
        : pounds.format(monthlyPrice / 100),
    creditPerCookDay:
      monthlyPrice === undefined
        ? "unavailable"
        : pounds.format((monthlyPrice * 12) / (52 * 2 * 100)),
  };
};

type ExpectedCredit = [invoiceId: string, total: number, missedDays: number];

const invoiceCredits = (
  expected: ExpectedCredit[],
  clearsPauseDate = true
) => ({
  expected,
  clearsPauseDate,
  split:
    expected
      .map(
        ([invoiceId, total]) =>
          `invoice ${invoiceId}: ${pounds.format(total / 100)}`
      )
      .join(", ") || "no credit notes",
});

const chargebee = new ChargeBee();

const callbackResponse = <T>(value: T) => ({
  request: (callback: (error: null, result: T) => void) =>
    callback(null, value),
});

describe("historical Chargebee resume webhooks", () => {
  const previousZone = Settings.defaultZone;
  const previousLocale = Settings.defaultLocale;

  beforeEach(() => {
    Settings.defaultZone = "utc";
    Settings.defaultLocale = "en-GB";
    vi.stubEnv(ENV.varNames.EnvironmentName, "prod");
    vi.stubEnv(ENV.varNames.ChargeBeeSite, "webhook-replay-test");
    vi.stubEnv(ENV.varNames.ChargeBeeToken, "test-key-secret");
    vi.stubEnv(ENV.varNames.ChargeBeeWebhookUsername, "test-user-secret");
    vi.stubEnv(ENV.varNames.ChargeBeeWebhookPasssword, "test-password-secret");
    vi.mocked(getSecrets).mockReturnValue([
      Promise.resolve("test-key"),
      Promise.resolve("test-user"),
      Promise.resolve("test-password"),
    ]);
    vi.mocked(reloadCustomerPlans).mockResolvedValue(undefined);
  });

  afterEach(() => {
    Settings.defaultZone = previousZone;
    Settings.defaultLocale = previousLocale;
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it.each`
    resumedOn       | resume                            | pauseStart                         | missedDays | totalCredit  | notePeriod                    | credits
    ${"2025-06-20"} | ${historicalResume("resume-001")} | ${"2025-05-31T23:00:00.000+00:00"} | ${6}       | ${"£250.38"} | ${"01/06/2025 to 20/06/2025"} | ${invoiceCredits([["invoice-018", 25038, 6]])}
    ${"2025-07-18"} | ${historicalResume("resume-002")} | ${"2025-07-12T23:00:00.000+00:00"} | ${2}       | ${"£83.46"}  | ${"13/07/2025 to 18/07/2025"} | ${invoiceCredits([["invoice-017", 8346, 2]])}
    ${"2025-08-08"} | ${historicalResume("resume-003")} | ${"2025-07-26T23:00:00.000+00:00"} | ${4}       | ${"£166.92"} | ${"27/07/2025 to 08/08/2025"} | ${invoiceCredits([["invoice-017", 8346, 2], ["invoice-016", 8346, 2]])}
    ${"2025-10-17"} | ${historicalResume("resume-004")} | ${"2025-10-11T23:00:00.000+00:00"} | ${2}       | ${"£83.46"}  | ${"12/10/2025 to 17/10/2025"} | ${invoiceCredits([["invoice-014", 8346, 2]])}
    ${"2025-11-07"} | ${historicalResume("resume-005")} | ${"2025-10-25T23:00:00.000+00:00"} | ${4}       | ${"£166.92"} | ${"26/10/2025 to 07/11/2025"} | ${invoiceCredits([["invoice-014", 8346, 2], ["invoice-013", 8346, 2]])}
    ${"2026-01-02"} | ${historicalResume("resume-006")} | ${"2025-12-21T00:00:00.000+00:00"} | ${4}       | ${"£166.92"} | ${"21/12/2025 to 02/01/2026"} | ${invoiceCredits([["invoice-012", 16692, 4]])}
    ${"2026-02-06"} | ${historicalResume("resume-007")} | ${"2026-01-25T00:00:00.000+00:00"} | ${4}       | ${"£166.92"} | ${"25/01/2026 to 06/02/2026"} | ${invoiceCredits([["invoice-011", 8346, 2], ["invoice-010", 8346, 2]])}
    ${"2026-04-10"} | ${historicalResume("resume-008")} | ${"2026-03-29T00:00:00.000+00:00"} | ${4}       | ${"£166.92"} | ${"29/03/2026 to 10/04/2026"} | ${invoiceCredits([["invoice-009", 4173, 1], ["invoice-008", 12519, 3]])}
    ${"2026-05-22"} | ${historicalResume("resume-009")} | ${"2026-05-09T23:00:00.000+00:00"} | ${4}       | ${"£166.92"} | ${"10/05/2026 to 22/05/2026"} | ${invoiceCredits([["invoice-007", 16692, 4]])}
    ${"2025-05-30"} | ${historicalResume("resume-029")} | ${"2025-05-24T23:00:00.000+00:00"} | ${2}       | ${"£88.93"}  | ${"25/05/2025 to 30/05/2025"} | ${invoiceCredits([["invoice-119", 8893, 2]])}
    ${"2025-06-13"} | ${historicalResume("resume-028")} | ${"2025-06-07T23:00:00.000+00:00"} | ${2}       | ${"£88.93"}  | ${"08/06/2025 to 13/06/2025"} | ${invoiceCredits([["invoice-118", 8893, 2]])}
    ${"2025-08-29"} | ${historicalResume("resume-027")} | ${"2025-08-02T23:00:00.000+00:00"} | ${8}       | ${"£355.69"} | ${"03/08/2025 to 29/08/2025"} | ${invoiceCredits([["invoice-116", 35569, 8]])}
    ${"2025-10-31"} | ${historicalResume("resume-026")} | ${"2025-10-25T23:00:00.000+00:00"} | ${2}       | ${"£88.93"}  | ${"26/10/2025 to 31/10/2025"} | ${invoiceCredits([["invoice-114", 8893, 2]])}
    ${"2026-01-09"} | ${historicalResume("resume-025")} | ${"2025-12-21T00:00:00.000+00:00"} | ${6}       | ${"£266.78"} | ${"21/12/2025 to 09/01/2026"} | ${invoiceCredits([["invoice-112", 17785, 4], ["invoice-111", 8893, 2]])}
    ${"2026-02-06"} | ${historicalResume("resume-024")} | ${"2026-01-25T00:00:00.000+00:00"} | ${4}       | ${"£177.86"} | ${"25/01/2026 to 06/02/2026"} | ${invoiceCredits([["invoice-111", 8893, 2], ["invoice-110", 8893, 2]])}
    ${"2026-03-06"} | ${historicalResume("resume-023")} | ${"2026-03-01T00:00:00.000+00:00"} | ${2}       | ${"£88.93"}  | ${"01/03/2026 to 06/03/2026"} | ${invoiceCredits([["invoice-109", 8893, 2]])}
    ${"2026-04-17"} | ${historicalResume("resume-022")} | ${"2026-04-04T23:00:00.000+00:00"} | ${4}       | ${"£177.85"} | ${"05/04/2026 to 17/04/2026"} | ${invoiceCredits([["invoice-108", 17785, 4]])}
    ${"2026-05-29"} | ${historicalResume("resume-021")} | ${"2026-05-23t23:00:00.000+00:00"} | ${2}       | ${"£88.93"}  | ${"24/05/2026 to 29/05/2026"} | ${invoiceCredits([["invoice-107", 8893, 2]])}
    ${"2025-05-30"} | ${historicalResume("resume-020")} | ${"2025-05-24T23:00:00.000+00:00"} | ${2}       | ${"£55.96"}  | ${"25/05/2025 to 30/05/2025"} | ${invoiceCredits([["invoice-090", 5596, 2]])}
    ${"2025-09-12"} | ${historicalResume("resume-019")} | ${"2025-09-06T23:00:00.000+00:00"} | ${2}       | ${"£55.96"}  | ${"07/09/2025 to 12/09/2025"} | ${invoiceCredits([["invoice-085", 5596, 2]])}
    ${"2025-11-14"} | ${historicalResume("resume-018")} | ${"2025-11-02T00:00:00.000+00:00"} | ${4}       | ${"£111.92"} | ${"02/11/2025 to 14/11/2025"} | ${invoiceCredits([["invoice-083", 11192, 4]])}
    ${"2026-05-01"} | ${historicalResume("resume-017")} | ${"2026-04-18T23:00:00.000+00:00"} | ${4}       | ${"£111.92"} | ${"19/04/2026 to 01/05/2026"} | ${invoiceCredits([["invoice-078", 11192, 4]])}
    ${"2025-05-09"} | ${historicalResume("resume-016")} | ${"2025-05-03T23:00:00.000+00:00"} | ${2}       | ${"£55.96"}  | ${"04/05/2025 to 09/05/2025"} | ${invoiceCredits([["invoice-059", 5596, 2]])}
    ${"2025-06-06"} | ${historicalResume("resume-015")} | ${"2025-05-31T23:00:00.000+00:00"} | ${2}       | ${"£55.96"}  | ${"01/06/2025 to 06/06/2025"} | ${invoiceCredits([["invoice-058", 5596, 2]])}
    ${"2025-08-01"} | ${historicalResume("resume-014")} | ${"2025-07-26T23:00:00.000+00:00"} | ${2}       | ${"£59.46"}  | ${"27/07/2025 to 01/08/2025"} | ${invoiceCredits([["invoice-056", 5946, 2]])}
    ${"2025-09-25"} | ${historicalResume("resume-013")} | ${"2025-09-20T22:00:00.000+00:00"} | ${2}       | ${"£59.46"}  | ${"20/09/2025 to 25/09/2025"} | ${invoiceCredits([["invoice-054", 5946, 2]])}
    ${"2025-11-14"} | ${historicalResume("resume-012")} | ${"2025-11-09T00:00:00.000+00:00"} | ${2}       | ${"£59.46"}  | ${"09/11/2025 to 14/11/2025"} | ${invoiceCredits([["invoice-052", 5946, 2]])}
    ${"2026-05-01"} | ${historicalResume("resume-011")} | ${"2026-04-18T23:00:00.000+00:00"} | ${4}       | ${"£118.92"} | ${"19/04/2026 to 01/05/2026"} | ${invoiceCredits([["invoice-047", 11892, 4]])}
    ${"2026-05-29"} | ${historicalResume("resume-010")} | ${"2026-05-24T23:00:00.000+00:00"} | ${1}       | ${"£0.00"}   | ${"25/05/2026 to 29/05/2026"} | ${invoiceCredits([], false)}
  `(
    "$resume.customerName | Paused $pauseStart, resumed $resumedOn | $missedDays missed cook days | MRR $resume.mrr | $resume.creditPerCookDay per cook day | $totalCredit total credit ($credits.split)",
    async ({ resume, notePeriod, credits }) => {
      const { event, eventId } = resume;
      if (!event) {
        throw new Error(`Missing Chargebee replay event ${eventId}`);
      }

      const { customer, subscription } = event.content;
      const invoices = records.invoices
        .filter(
          (invoice) =>
            invoice.subscription_id === subscription.id &&
            (invoice.generated_at ?? invoice.date) <= event.occurred_at
        )
        .sort((left, right) => right.date - left.date)
        .map((invoice) => ({ invoice }));

      vi.spyOn(chargebee.invoice, "list").mockReturnValue(
        callbackResponse({ list: invoices }) as ReturnType<
          typeof chargebee.invoice.list
        >
      );
      const createCreditNote = vi
        .spyOn(chargebee.credit_note, "create")
        .mockReturnValue(
          callbackResponse({ credit_note: {} }) as ReturnType<
            typeof chargebee.credit_note.create
          >
        );
      const updateSubscription = vi
        .spyOn(chargebee.subscription, "update_for_items")
        .mockReturnValue(
          callbackResponse({ subscription }) as ReturnType<
            typeof chargebee.subscription.update_for_items
          >
        );

      const response = await handler(
        mock<APIGatewayProxyEventV2>({
          headers: {
            Authorization: `Basic ${Buffer.from(
              "test-user:test-password"
            ).toString("base64")}`,
          },
          body: JSON.stringify({
            ...event,
            // The MCP event detail uses enum casing; the webhook expects lowercase.
            event_type: event.event_type.toLowerCase(),
          }),
        }),
        mock(),
        vi.fn()
      );

      expect(response).toEqual({ statusCode: 200 });
      expect(reloadCustomerPlans).toHaveBeenCalledWith(
        expect.any(ChargeBee),
        customer.id
      );
      expect(createCreditNote.mock.calls).toEqual(
        credits.expected.map(([invoiceId, total, days]: ExpectedCredit) => [
          {
            reference_invoice_id: invoiceId,
            total,
            type: "REFUNDABLE",
            create_reason_code: "Subscription Paused",
            customer_notes: `Paused from ${notePeriod}. Crediting for ${days} missed cookday${
              days === 1 ? "" : "s"
            }`,
          },
        ])
      );
      expect(updateSubscription.mock.calls).toEqual(
        credits.clearsPauseDate
          ? [[subscription.id, { cf_Pause_date_ISO: "" }]]
          : []
      );
      if (credits.clearsPauseDate && credits.expected.length > 0) {
        expect(updateSubscription.mock.invocationCallOrder[0]).toBeGreaterThan(
          Math.max(...createCreditNote.mock.invocationCallOrder)
        );
      }
    }
  );
});
