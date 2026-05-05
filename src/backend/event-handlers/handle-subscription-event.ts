import { ChargeBee } from "chargebee-typescript";
import { reloadCustomerPlans } from "../utils/reload-customer-plans";

export const handleSubscriptionEvent = async (
  client: ChargeBee,
  customerId: string
) => {
  await reloadCustomerPlans(client, customerId);
};
