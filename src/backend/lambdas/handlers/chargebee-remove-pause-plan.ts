import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import "dotenv/config";
import {
  protectRoute,
  returnErrorResponse,
  returnOkResponse,
} from "@tnmo/core-backend";
import { getChargebeeClient } from '../chargebee/initialise';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const chargebee = await getChargebeeClient();

  try {
    await protectRoute(event, ["admin"]);
    const payload = JSON.parse(event.body ?? '');

    // cancel pause
    await new Promise<typeof chargebee.subscription>(
      (accept, reject) => {
        chargebee.subscription
          .remove_scheduled_pause(payload.plan_id)
          .request(function (
            error: unknown,
            result: { subscription: typeof chargebee.subscription }
          ) {
            if (error) {
              reject(error);
            } else {
              const subscription: typeof chargebee.subscription = result.subscription;
              console.log(`${result}`);
              accept(subscription);
            }
          });
      }
    );

    // clear pause date in custom field
    const subscription = await new Promise<typeof chargebee.subscription>(
      (accept, reject) => {
        chargebee.subscription
          .update_for_items(payload.plan_id, {
            cf_Pause_date_ISO: '',
          } as any)
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
      subscription: subscription
    }

    return returnOkResponse(responseData)
  } catch (error) {
    return returnErrorResponse(error)
  }
}