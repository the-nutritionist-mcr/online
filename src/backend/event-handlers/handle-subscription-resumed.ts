import { ChargeBee } from "chargebee-typescript";
import { Customer } from 'chargebee-typescript/lib/resources';
import { handleSubscriptionEvent } from './handle-subscription-event';
import { apiRequest } from '@tnmo/core';
import { BackendCustomer } from '@tnmo/types';

export const handleSubscriptionResumed = async (
  client: ChargeBee,
  customerId: string,
  subscriptionId: string,
  subscriptionMrr: number,
  pauseStartDate: string
) => {
  await handleSubscriptionEvent(client, customerId);

  console.log("customerId:", customerId);
  console.log("subscriptionId:", subscriptionId);
  console.log("subscriptionMrr:", subscriptionMrr);
  console.log("pauseStartDate:", pauseStartDate);

  if (pauseStartDate.length > 0) return;

  await apiRequest<BackendCustomer>("chargebee-issue-pause-credit", {
    method: "POST",
    body: JSON.stringify({
      "subscription_id": subscriptionId,
      "subscription_mrr": subscriptionMrr,
      "pause_start_date": pauseStartDate
    })
  })
};

