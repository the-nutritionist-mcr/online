import { DateTime } from "luxon";
import { mock } from "vitest-mock-extended";
import { ChargeBee } from "chargebee-typescript";
import { Event } from "chargebee-typescript/lib/resources";
import { handleSubscriptionPauseScheduled } from "./handle-subscription-pause-scheduled";
import { handleSubscriptionScheduledPauseRemoved } from "./handle-subscription-scheduled-pause-removed";
import { setPauseDate } from "./subscription-pausing/set-pause-date";

vi.mock("./subscription-pausing/set-pause-date", () => ({
  setPauseDate: vi.fn(),
}));

describe("pause subscription event handlers", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("stores the scheduled pause start date from the subscription payload", async () => {
    const client = mock<ChargeBee>();
    const event = mock<Event>({
      content: {
        subscription: {
          id: "sub_test",
          pause_date: 1_715_372_800,
        },
      },
    });

    await handleSubscriptionPauseScheduled(client, event);

    expect(setPauseDate).toHaveBeenCalledWith(
      client,
      "sub_test",
      DateTime.fromSeconds(1_715_372_800)
    );
  });

  it("does nothing when the scheduled pause start is missing", async () => {
    const client = mock<ChargeBee>();
    const event = mock<Event>({
      content: {
        subscription: {
          id: "sub_test",
        },
      },
    });

    await handleSubscriptionPauseScheduled(client, event);

    expect(setPauseDate).not.toHaveBeenCalled();
  });

  it("clears the stored pause date when a scheduled pause is removed", async () => {
    const client = mock<ChargeBee>();
    const event = mock<Event>({
      content: {
        subscription: {
          id: "sub_test",
        },
      },
    });

    await handleSubscriptionScheduledPauseRemoved(client, event);

    expect(setPauseDate).toHaveBeenCalledWith(client, "sub_test", null);
  });
});
