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

    // get latest invoice so we can create a credit note
    const invoice = await new Promise<typeof chargebee.invoice>(
      (accept, reject) => {
        chargebee.invoice
          .list({
            limit: 1,
            subscription_id: { is: payload.subscription_id },
            status: { in: ["paid", "payment_due"] },
            "sort_by[desc]": "date"
          })
          .request(function (
            error: unknown,
            result: { list: typeof chargebee.invoice[] }
          ) {
            if (error) {
              reject(error);
            } else {
              // console.log(`(result.list[0] as any).invoice: ${(result.list[0] as any).invoice}`);
              accept((result.list[0] as any).invoice);
            }
          });
      });

    const responseData = {
      invoice: invoice
    }

    return returnOkResponse(responseData)
  } catch (error) {
    return returnErrorResponse(error)
  }
}
