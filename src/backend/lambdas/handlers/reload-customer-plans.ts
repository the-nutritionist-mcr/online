import { reloadCustomerPlans } from "@/backend/utils/reload-customer-plans";
import {
  protectRoute,
  returnErrorResponse,
  returnOkResponse,
} from "@tnmo/core-backend";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getChargebeeClient } from "../chargebee/initialise";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const chargebee = await getChargebeeClient();
    const payload = JSON.parse(event.body ?? "");
    await reloadCustomerPlans(chargebee, payload.customerId);
    return returnOkResponse({});
  } catch (error) {
    return returnErrorResponse(error);
  }
};
