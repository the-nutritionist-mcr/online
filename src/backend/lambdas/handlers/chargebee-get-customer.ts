import "dotenv/config";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getChargebeeClient } from "../chargebee/initialise";
import {
  protectRoute,
  returnOkResponse,
  returnErrorResponse,
} from "@tnmo/core-backend";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const chargebee = await getChargebeeClient();

  try {
    await protectRoute(event, ["admin"]);
    const payload = JSON.parse(event.body ?? '');
  
    const result = await new Promise<typeof chargebee.customer>(
      (accept, reject) => {
        chargebee.customer
          .retrieve(payload.id)
          .request(function (
            error: unknown,
            result: { customer: typeof chargebee.customer }
          ) {
            if (error) {
              reject(error);
            } else {
              const customer: typeof chargebee.customer = result.customer;
              accept(customer);
            }
          });
      }
    );

    const responseData = {
      customer: result
    }

    return returnOkResponse(responseData)
  } catch (error) {
    return returnErrorResponse(error)
  }
}