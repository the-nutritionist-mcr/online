import { DateTime } from "luxon";
import { mock } from "vitest-mock-extended";
import { ChargeBee } from "chargebee-typescript";
import { Event } from "chargebee-typescript/lib/resources";
import {
  handleSubscriptionPaused,
  handleSubscriptionPauseScheduled,
} from "./handle-subscription-pause-scheduled";
import { handleSubscriptionScheduledPauseRemoved } from "./handle-subscription-scheduled-pause-removed";
import { setPauseDate } from "./subscription-pausing/set-pause-date";

vi.mock("./subscription-pausing/set-pause-date", () => ({
  setPauseDate: vi.fn(),
}));

describe("pause subscription event handlers", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const subscriptionId = "sub_test";
  const pauseDate = 1_715_372_800;

  const occurredAt = pauseDate + 60;

  it.each`
    name                                                                     | handler                                    | subscription                                     | expectedCalls
    ${"stores the scheduled pause start date from the subscription payload"} | ${handleSubscriptionPauseScheduled}        | ${{ id: subscriptionId, pause_date: pauseDate }} | ${[[subscriptionId, DateTime.fromSeconds(pauseDate)]]}
    ${"does nothing when the scheduled pause start is missing"}              | ${handleSubscriptionPauseScheduled}        | ${{ id: subscriptionId }}                        | ${[]}
    ${"clears the stored pause date when a scheduled pause is removed"}      | ${handleSubscriptionScheduledPauseRemoved} | ${{ id: subscriptionId }}                        | ${[[subscriptionId, null]]}
    ${"stores when an immediate pause occurred"}                             | ${handleSubscriptionPaused}                | ${{ id: subscriptionId }}                        | ${[[subscriptionId, DateTime.fromSeconds(occurredAt)]]}
    ${"uses the actual pause date when Chargebee supplies it"}               | ${handleSubscriptionPaused}                | ${{ id: subscriptionId, pause_date: pauseDate }} | ${[[subscriptionId, DateTime.fromSeconds(pauseDate)]]}
  `("$name", async ({ handler, subscription, expectedCalls }) => {
    const client = mock<ChargeBee>();
    const event = mock<Event>({
      occurred_at: occurredAt,
      content: { subscription },
    });

    await handler(client, event);

    expect(vi.mocked(setPauseDate).mock.calls).toEqual(
      expectedCalls.map((args: [string, DateTime | null]) => [client, ...args])
    );
  });
});
