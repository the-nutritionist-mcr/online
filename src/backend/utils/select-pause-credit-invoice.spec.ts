import { DateTime } from "luxon";
import {
  findInvoiceContainingDate,
  getPauseCreditNoteType,
} from "./select-pause-credit-invoice";

const toUnixSeconds = (isoDate: string) =>
  Date.parse(`${isoDate}T00:00:00Z`) / 1000;

const createInvoice = ({
  billedPeriodEnd,
  billedPeriodStart,
  date,
  id,
}: {
  billedPeriodEnd: string;
  billedPeriodStart: string;
  date?: string;
  id: string;
}) => ({
  id,
  date: toUnixSeconds(date ?? billedPeriodStart),
  line_items: [
    {
      date_from: toUnixSeconds(billedPeriodStart),
      date_to: toUnixSeconds(billedPeriodEnd),
    },
  ],
});

describe("findInvoiceContainingDate", () => {
  it("returns the invoice containing the supplied date", () => {
    const invoice = findInvoiceContainingDate({
      date: DateTime.fromISO("2024-03-20"),
      invoices: [
        createInvoice({
          id: "inv_newer",
          billedPeriodStart: "2024-04-01",
          billedPeriodEnd: "2024-05-01",
        }),
        createInvoice({
          id: "inv_match",
          billedPeriodStart: "2024-03-01",
          billedPeriodEnd: "2024-04-01",
        }),
      ],
    });

    expect(invoice?.id).toBe("inv_match");
  });

  it("returns undefined when no invoice contains the supplied date", () => {
    const invoice = findInvoiceContainingDate({
      date: DateTime.fromISO("2024-03-20"),
      invoices: [
        createInvoice({
          id: "inv_old",
          billedPeriodStart: "2024-01-01",
          billedPeriodEnd: "2024-02-01",
          date: "2024-01-01",
        }),
        createInvoice({
          id: "inv_new",
          billedPeriodStart: "2024-05-01",
          billedPeriodEnd: "2024-06-01",
          date: "2024-05-01",
        }),
      ],
    });

    expect(invoice).toBeUndefined();
  });
});

describe("getPauseCreditNoteType", () => {
  it("returns adjustment for payment_due invoices", () => {
    expect(getPauseCreditNoteType("payment_due")).toBe("ADJUSTMENT");
  });

  it("returns refundable for paid invoices", () => {
    expect(getPauseCreditNoteType("paid")).toBe("REFUNDABLE");
  });
});
