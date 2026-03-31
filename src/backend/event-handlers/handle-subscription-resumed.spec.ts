import { handleSubscriptionResumed } from "./handle-subscription-resumed";
import { handleSubscriptionEvent } from "./handle-subscription-event";

vi.mock("./handle-subscription-event", () => ({
  handleSubscriptionEvent: vi.fn().mockResolvedValue(undefined),
}));

type InvoiceFixture = {
  billedPeriodEnd: string;
  billedPeriodStart: string;
  date?: string;
  id: string;
  status: "paid" | "payment_due";
};

const toUnixSeconds = (isoDate: string) =>
  Date.parse(`${isoDate}T00:00:00Z`) / 1000;

const createInvoice = ({
  billedPeriodEnd,
  billedPeriodStart,
  date,
  id,
  status,
}: InvoiceFixture) => ({
  id,
  status,
  subscription_id: "sub_123",
  date: toUnixSeconds(date ?? billedPeriodStart),
  line_items: [
    {
      date_from: toUnixSeconds(billedPeriodStart),
      date_to: toUnixSeconds(billedPeriodEnd),
    },
  ],
});

const createClient = (invoices: InvoiceFixture[]) => {
  let createdCreditNotePayload: Record<string, unknown> | undefined;

  const client = {
    invoice: {
      list: vi.fn().mockReturnValue({
        request: (
          callback: (
            error: unknown,
            result: { list: Array<{ invoice: Record<string, unknown> }> }
          ) => void
        ) => {
          callback(null, {
            list: invoices.map((invoice) => ({
              invoice: createInvoice(invoice),
            })),
          });
        },
      }),
    },
    credit_note: {
      create: vi.fn().mockImplementation((payload: Record<string, unknown>) => {
        createdCreditNotePayload = payload;

        return {
          request: (
            callback: (
              error: unknown,
              result: { credit_note: Record<string, unknown> }
            ) => void
          ) => {
            callback(null, {
              credit_note: {
                id: "cn_123",
              },
            });
          },
        };
      }),
    },
    subscription: {
      update_for_items: vi.fn().mockReturnValue({
        request: (
          callback: (
            error: unknown,
            result: { subscription: Record<string, unknown> }
          ) => void
        ) => {
          callback(null, {
            subscription: {
              id: "sub_123",
            },
          });
        },
      }),
    },
  } as any;

  return { client, getCreatedCreditNotePayload: () => createdCreditNotePayload };
};

describe("handleSubscriptionResumed", () => {
  it("does nothing for an in-term resumption because Chargebee should already prorate it", async () => {
    const { client, getCreatedCreditNotePayload } = createClient([
      {
        id: "inv_same_term",
        status: "paid",
        billedPeriodStart: "2024-07-01",
        billedPeriodEnd: "2024-08-01",
      },
    ]);

    await handleSubscriptionResumed(
      client,
      "customer_123",
      "sub_123",
      36166,
      "2024-07-12T00:00:00.000Z",
      "2024-07-23T00:00:00.000Z"
    );

    expect(handleSubscriptionEvent).toHaveBeenCalledWith(client, "customer_123");
    expect(getCreatedCreditNotePayload()).toBeUndefined();
    expect(client.subscription.update_for_items).toHaveBeenCalledWith("sub_123", {
      cf_Pause_date_ISO: "",
    });
  });

  it("creates a refundable credit note against the invoice containing the pause start for an out-of-term resumption", async () => {
    const { client, getCreatedCreditNotePayload } = createClient([
      {
        id: "inv_resume_term",
        status: "paid",
        billedPeriodStart: "2024-04-01",
        billedPeriodEnd: "2024-05-01",
        date: "2024-04-01",
      },
      {
        id: "inv_pause_start_term",
        status: "paid",
        billedPeriodStart: "2024-03-01",
        billedPeriodEnd: "2024-04-01",
        date: "2024-03-01",
      },
    ]);

    await handleSubscriptionResumed(
      client,
      "customer_123",
      "sub_123",
      36166,
      "2024-03-20T00:00:00.000Z",
      "2024-04-05T00:00:00.000Z"
    );

    expect(getCreatedCreditNotePayload()).toMatchObject({
      reference_invoice_id: "inv_pause_start_term",
      total: 14308,
      type: "REFUNDABLE",
    });
  });

  it("creates an adjustment credit note when the pause-start invoice is payment_due", async () => {
    const { client, getCreatedCreditNotePayload } = createClient([
      {
        id: "inv_resume_term",
        status: "paid",
        billedPeriodStart: "2024-11-01",
        billedPeriodEnd: "2024-12-01",
        date: "2024-11-01",
      },
      {
        id: "inv_pause_start_term",
        status: "payment_due",
        billedPeriodStart: "2024-10-01",
        billedPeriodEnd: "2024-11-01",
        date: "2024-10-01",
      },
    ]);

    await handleSubscriptionResumed(
      client,
      "customer_123",
      "sub_123",
      36166,
      "2024-10-25T00:00:00.000Z",
      "2024-11-05T00:00:00.000Z"
    );

    expect(getCreatedCreditNotePayload()).toMatchObject({
      reference_invoice_id: "inv_pause_start_term",
      total: 8346,
      type: "ADJUSTMENT",
    });
  });
});
