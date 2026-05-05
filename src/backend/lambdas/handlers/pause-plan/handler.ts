import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import "dotenv/config";
import {
  protectRoute,
  returnErrorResponse,
  returnOkResponse,
} from "@tnmo/core-backend";
import { getChargebeeClient } from "../../chargebee/initialise";
import { pauseSubscription } from "./pause-subscription";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const chargebee = await getChargebeeClient();

  try {
    await protectRoute(event);
    const payload = JSON.parse(event.body ?? "");

    const pausedSubscription = await pauseSubscription(
      chargebee,
      payload.plan_id,
      payload.pause_date,
      payload.resume_date
    );

    const responseData = {
      subscription: pausedSubscription,
    };

    return returnOkResponse(responseData);
  } catch (error) {
    return returnErrorResponse(error);
  }
};
