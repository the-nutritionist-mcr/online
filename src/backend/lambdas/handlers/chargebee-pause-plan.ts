import "dotenv/config";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { chargebee } from "../chargebee/initialise";

import {
  protectRoute,
  returnOkResponse,
  returnErrorResponse,
} from "@tnmo/core-backend";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const payload = JSON.parse(event.body ?? '');

    const result = await new Promise<typeof chargebee.subscription>(
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
              console.log(`${result}`);
              accept(subscription);
            }
          });
      }
    );

    const responseData = {
      subscription: result
    }

    return returnOkResponse(responseData)
  } catch (error) {
    return returnErrorResponse(error)
  }
}



// chargebee customer id: "77ECsTyblGXbD2P"
// my plan id: "BTUNdaTybyFUOEi2"
