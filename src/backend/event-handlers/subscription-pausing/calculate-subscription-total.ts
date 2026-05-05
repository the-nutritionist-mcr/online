import { Subscription } from "chargebee-typescript/lib/resources";

export const calculateSubscriptionTotal = (subscription: Subscription) => {
  return subscription.subscription_items?.reduce(
    (total, item) => total + (item.unit_price ?? 0) * (item.quantity ?? 0),
    0
  );
};
