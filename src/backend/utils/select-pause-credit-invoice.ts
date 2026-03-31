import { DateTime } from "luxon";

type ChargebeeInvoice = {
  date?: number;
  id?: string;
  line_items?: Array<{
    date_from?: number;
    date_to?: number;
  }>;
  status?: string;
};

export const getInvoiceBilledPeriod = (invoice: ChargebeeInvoice) => {
  const datedLineItems = (invoice?.line_items ?? []).filter(
    (lineItem) =>
      typeof lineItem.date_from === "number" &&
      typeof lineItem.date_to === "number"
  );

  if (datedLineItems.length === 0) {
    return {};
  }

  const billedPeriodStart = DateTime.fromSeconds(
    Math.min(...datedLineItems.map((lineItem) => lineItem.date_from as number))
  ).startOf("day");
  const billedPeriodEnd = DateTime.fromSeconds(
    Math.max(...datedLineItems.map((lineItem) => lineItem.date_to as number))
  ).startOf("day");

  return { billedPeriodStart, billedPeriodEnd };
};

const getInvoiceTimestamp = (invoice: ChargebeeInvoice) => invoice.date ?? 0;

const sortNewestFirst = (a: ChargebeeInvoice, b: ChargebeeInvoice) =>
  getInvoiceTimestamp(b) - getInvoiceTimestamp(a);

const containsDate = (
  date: DateTime,
  billedPeriodStart?: DateTime,
  billedPeriodEnd?: DateTime
) =>
  !!billedPeriodStart &&
  !!billedPeriodEnd &&
  date >= billedPeriodStart &&
  date < billedPeriodEnd;

export const findInvoiceContainingDate = ({
  date,
  invoices,
}: {
  date: DateTime;
  invoices: ChargebeeInvoice[];
}) => {
  const candidates = invoices
    .map((invoice) => ({
      billedPeriod: getInvoiceBilledPeriod(invoice),
      invoice,
    }))
    .sort((a, b) => sortNewestFirst(a.invoice, b.invoice));

  const dateMatch = candidates.find(({ billedPeriod }) =>
    containsDate(
      date,
      billedPeriod.billedPeriodStart,
      billedPeriod.billedPeriodEnd
    )
  );

  return dateMatch?.invoice;
};

export const getPauseCreditNoteType = (invoiceStatus?: string) =>
  invoiceStatus === "payment_due" ? "ADJUSTMENT" : "REFUNDABLE";
