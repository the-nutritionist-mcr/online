import "dotenv/config";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { chargebee } from "../chargebee/initialise";
import { DateTime } from "luxon";

import {
  protectRoute,
  returnOkResponse,
  returnErrorResponse,
} from "@tnmo/core-backend";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
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
              console.log(`result.list[0].invoice: ${result.list[0].invoice}`);
              accept(result.list[0].invoice);
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



// chargebee customer id: "77ECsTyblGXbD2P"
// my plan id: "BTUNdaTybyFUOEi2"
