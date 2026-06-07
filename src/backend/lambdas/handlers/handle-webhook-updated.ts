import { APIGatewayProxyEventV2 } from "aws-lambda";
import { ChargeBee } from "chargebee-typescript";

import { ENV, HTTP } from "@tnmo/constants";
import { handleCustomerEvent } from "../../event-handlers/handle-customer-event";
import { handleSubscriptionEvent } from "../../event-handlers/handle-subscription-event";
import {
  getSecrets,
  getEnv,
  authoriseBasic,
  returnErrorResponse,
} from "@tnmo/core-backend";

import { handleDeleteCustomer } from "../../event-handlers/handle-delete-customer";
import { updatedHandledSubscriptionResumed } from "@/backend/event-handlers/updated-handled-subscription-resumed";
import { handleSubscriptionPauseScheduled } from "@/backend/event-handlers/handle-subscription-pause-scheduled";
import { handleSubscriptionScheduledPauseRemoved } from "@/backend/event-handlers/handle-subscription-scheduled-pause-removed";

export const handleWebhookUpdated = async (event: APIGatewayProxyEventV2) => {
  const chargebee = new ChargeBee();

  const [chargebeeToken, chargebeeWebhookUsername, chargebeeWebhookPassword] =
    getSecrets(
      getEnv(ENV.varNames.ChargeBeeToken),
      getEnv(ENV.varNames.ChargeBeeWebhookUsername),
      getEnv(ENV.varNames.ChargeBeeWebhookPasssword)
    );

  chargebee.configure({
    site: process.env[ENV.varNames.ChargeBeeSite],
    api_key: await chargebeeToken,
  });

  const chargebeeEvent = chargebee.event.deserialize(event.body || "");
  const customer = chargebeeEvent.content.customer;
  const customerId = customer?.id;
  const customerEmail = customer?.email;

  try {
    console.log("Received Chargebee webhook", {
      eventId: chargebeeEvent.id,
      eventType: chargebeeEvent.event_type,
      customerId,
      customerEmail,
    });

    authoriseBasic(
      event,
      (await chargebeeWebhookUsername) || "",
      (await chargebeeWebhookPassword) || ""
    );

    const { email } = chargebeeEvent.content["customer"];

    const environment = process.env[ENV.varNames.EnvironmentName];

    if (!email) {
      return {
        statusCode: HTTP.statusCodes.Ok,
      };
    }

    if (
      environment !== "prod" &&
      (!email || !email.trim().toLowerCase().endsWith("thenutritionistmcr.com"))
    ) {
      return {
        statusCode: HTTP.statusCodes.Ok,
      };
    }

    switch (chargebeeEvent.event_type) {
      case "customer_created":
      case "customer_changed":
        await handleCustomerEvent(chargebee, chargebeeEvent);
        break;

      case "customer_deleted":
        await handleDeleteCustomer(chargebeeEvent.content.customer.id);
        break;

      case "subscription_resumed":
        console.log("Handling subscription resumed event", {
          eventId: chargebeeEvent.id,
          customerId,
          subscriptionId: chargebeeEvent.content.subscription?.id,
        });
        await handleSubscriptionEvent(
          chargebee,
          chargebeeEvent.content.customer.id
        );
        console.log("Finished plan reload for resumed subscription", {
          eventId: chargebeeEvent.id,
          customerId,
          subscriptionId: chargebeeEvent.content.subscription?.id,
        });
        await updatedHandledSubscriptionResumed(chargebee, chargebeeEvent);
        console.log("Finished resumed subscription post-processing", {
          eventId: chargebeeEvent.id,
          customerId,
          subscriptionId: chargebeeEvent.content.subscription?.id,
        });
        break;

      case "subscription_paused":
        await handleSubscriptionEvent(
          chargebee,
          chargebeeEvent.content.customer.id
        );
        break;

      case "subscription_pause_scheduled":
        await handleSubscriptionPauseScheduled(chargebee, chargebeeEvent);
        await handleSubscriptionEvent(
          chargebee,
          chargebeeEvent.content.customer.id
        );
        break;

      case "subscription_scheduled_pause_removed":
        await handleSubscriptionScheduledPauseRemoved(
          chargebee,
          chargebeeEvent
        );
        await handleSubscriptionEvent(
          chargebee,
          chargebeeEvent.content.customer.id
        );
        break;

      case "subscription_created":
      case "subscription_started":
      case "subscription_activated":
      case "subscription_changed":
      case "subscription_cancelled":
      case "subscription_cancellation_scheduled":
      case "subscription_reactivated":
      case "subscription_renewed":
      case "subscription_deleted":
      case "subscription_resumption_scheduled":
      case "subscription_scheduled_resumption_removed":
        await handleSubscriptionEvent(
          chargebee,
          chargebeeEvent.content.customer.id
        );
        break;
    }

    return {
      statusCode: HTTP.statusCodes.Ok,
    };
  } catch (error) {
    console.error("Chargebee webhook handler failed", {
      eventId: chargebeeEvent.id,
      eventType: chargebeeEvent.event_type,
      customerId,
      customerEmail,
      subscriptionId: chargebeeEvent.content.subscription?.id,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return returnErrorResponse(error, { eventId: chargebeeEvent.id });
  }
};
