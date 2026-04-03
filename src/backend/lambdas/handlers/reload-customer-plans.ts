import { reloadCustomerPlans } from "@/backend/utils/reload-customer-plans";
import {
  protectRoute,
  returnErrorResponse,
  returnOkResponse,
} from "@tnmo/core-backend";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getChargebeeClient } from "../chargebee/initialise";
import { CHARGEBEE } from "@tnmo/constants";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const client = await getChargebeeClient();
    const payload = JSON.parse(event.body ?? "");
    await reloadCustomerPlans(client, payload.customerId);

    const response = await client.subscription
      .list({
        customer_id: { is: payload.customerId },
        status: {
          in: [
            CHARGEBEE.subscriptionStatuses.active,
            CHARGEBEE.subscriptionStatuses.paused,
            CHARGEBEE.subscriptionStatuses.nonRenewing,
            CHARGEBEE.subscriptionStatuses.future,
          ],
        },
      })
      .request();

    const { list } = response;
    return returnOkResponse({ response });
  } catch (error) {
    return returnErrorResponse(error);
  }
};
