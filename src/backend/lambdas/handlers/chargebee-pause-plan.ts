import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import "dotenv/config";
import { chargebee } from "../chargebee/initialise";

import {
  protectRoute,
  returnErrorResponse,
  returnOkResponse,
} from "@tnmo/core-backend";
import { DateTime } from 'luxon';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const payload = JSON.parse(event.body ?? '');

    // do pause
    await new Promise<typeof chargebee.subscription>(
      (accept, reject) => {
        chargebee.subscription
          .pause(payload.plan_id, {
            pause_option: "specific_date",
            pause_date: payload.pause_date,
            resume_date: payload.resume_date
          })
          .request(function (
            error: unknown,
            result: { subscription: typeof chargebee.subscription }
          ) {
            if (error) {
              reject(error);
            } else {
              const subscription: typeof chargebee.subscription = result.subscription;
              console.log(`subscription: ${result}`);
              accept(subscription);
            }
          });
      }
    );

    // store pause date in custom field
    const pausedSubscription = await new Promise<typeof chargebee.subscription>(
      (accept, reject) => {
        chargebee.subscription
          .update_for_items(payload.plan_id, {
            cf_Pause_date_ISO: DateTime.fromSeconds(payload.pause_date).toISO(),
          })
          .request(function (
            error: unknown,
            result: { subscription: typeof chargebee.subscription }
          ) {
            if (error) {
              reject(error);
            } else {
              const subscription: typeof chargebee.subscription = result.subscription;
              console.log(`subscription: ${result}`);
              accept(subscription);
            }
          });
      }
    );

    const responseData = {
      subscription: pausedSubscription
    }

    return returnOkResponse(responseData)
  } catch (error) {
    return returnErrorResponse(error)
  }
}