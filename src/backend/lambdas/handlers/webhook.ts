import "../../utils/init-dd-trace";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ChargeBee } from "chargebee-typescript";
import { DateTime } from "luxon";

import { ENV, HTTP, isFeatureEnabled } from "@tnmo/constants";
import { handleCustomerEvent } from "../../event-handlers/handle-customer-event";
import { handleSubscriptionEvent } from "../../event-handlers/handle-subscription-event";
import {
  getSecrets,
  getEnv,
  authoriseBasic,
  returnErrorResponse,
} from "@tnmo/core-backend";

import { handleDeleteCustomer } from "../../event-handlers/handle-delete-customer";
import { handleSubscriptionResumed } from '@/backend/event-handlers/handle-subscription-resumed';

const updatePauseStartDate = async (
  chargebee: ChargeBee,
  subscriptionId: string,
  pauseDateIso: string
) => {
  await new Promise<typeof chargebee.subscription>((accept, reject) => {
    chargebee.subscription
      .update_for_items(subscriptionId, {
        cf_Pause_date_ISO: pauseDateIso,
      } as any)
      .request(function(
        error: unknown,
        result: { subscription: typeof chargebee.subscription }
      ) {
        if (error) {
          reject(error);
        } else {
          accept(result.subscription);
        }
      });
  });
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
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

  try {
    authoriseBasic(
      event,
      (await chargebeeWebhookUsername) || "",
      (await chargebeeWebhookPassword) || ""
    );

    const chargebeeEvent = chargebee.event.deserialize(event.body || "");

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

    // console.log('CHARGEBEE EVENT RECEIVED:', chargebeeEvent.event_type);

    switch (chargebeeEvent.event_type) {
      case "customer_created":
      case "customer_changed":
        await handleCustomerEvent(chargebee, chargebeeEvent);
        break;

      case "customer_deleted":
        await handleDeleteCustomer(chargebeeEvent.content.customer.id);
        break;

      case "subscription_resumed":
        await handleSubscriptionResumed(
          chargebee,
          chargebeeEvent.content.customer.id,
          chargebeeEvent.content.subscription.id,
          chargebeeEvent.content.subscription.mrr ?? 0,
          (chargebeeEvent.content.subscription as any).cf_Pause_date_ISO,
          DateTime.fromSeconds(chargebeeEvent.occurred_at).toISO() ?? ""
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
      case "subscription_paused":
      case "subscription_resumption_scheduled":
      case "subscription_scheduled_resumption_removed":
        await handleSubscriptionEvent(
          chargebee,
          chargebeeEvent.content.customer.id
        );
        break;

      case "subscription_pause_scheduled":
        if (
          isFeatureEnabled("updatedPauseLogic") &&
          chargebeeEvent.content.subscription.pause_date
        ) {
          await updatePauseStartDate(
            chargebee,
            chargebeeEvent.content.subscription.id,
            DateTime.fromSeconds(
              chargebeeEvent.content.subscription.pause_date
            ).toISO() ?? ""
          );
        }

        await handleSubscriptionEvent(
          chargebee,
          chargebeeEvent.content.customer.id
        );
        break;

      case "subscription_scheduled_pause_removed":
        if (isFeatureEnabled("updatedPauseLogic")) {
          await updatePauseStartDate(
            chargebee,
            chargebeeEvent.content.subscription.id,
            ""
          );
        }

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
    return returnErrorResponse(error);
  }
};
