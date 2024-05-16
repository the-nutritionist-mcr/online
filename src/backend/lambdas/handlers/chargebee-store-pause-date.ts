import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import "dotenv/config";
import { chargebee } from "../chargebee/initialise";

import {
  protectRoute,
  returnErrorResponse,
  returnOkResponse,
} from "@tnmo/core-backend";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const payload = JSON.parse(event.body ?? '');

    // store pause date in custom field on subscription payload.plan_id
    const subscription = await new Promise<typeof chargebee.subscription>(
      (accept, reject) => {
        chargebee.subscription
          .update_for_items(payload.plan_id, {
            cf_Pause_date_ISO: payload.pause_date,
          } as any)
          .request(function (
            error: unknown,
            result: { subscription: typeof chargebee.subscription }
          ) {
            if (error) {
              reject(error);
            } else {
              const subscription: typeof chargebee.subscription = result.subscription;
              accept(subscription);
            }
          });
      }
    );

    const responseData = {
      subscription: subscription
    }

    return returnOkResponse(responseData)
  } catch (error) {
    return returnErrorResponse(error)
  }
}