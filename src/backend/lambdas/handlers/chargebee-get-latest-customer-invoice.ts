import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import "dotenv/config";

import {
  protectRoute,
  returnErrorResponse,
  returnOkResponse,
} from "@tnmo/core-backend";
import { isFeatureEnabled } from "@/constants/env";
import { getChargebeeClient } from '../chargebee/initialise';
import { DateTime } from "luxon";
import { findInvoiceContainingDate } from "@/backend/utils/select-pause-credit-invoice";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const chargebee = await getChargebeeClient();

  try {
    await protectRoute(event, ["admin"]);
    const payload = JSON.parse(event.body ?? '');

    if (!isFeatureEnabled("updatedPauseLogic")) {
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
                accept((result.list[0] as any).invoice);
              }
            });
        });

      return returnOkResponse({
        invoice,
      });
    }

    const invoices = await new Promise<any[]>(
      (accept, reject) => {
        chargebee.invoice
          .list({
            limit: 100,
            subscription_id: { is: payload.subscription_id },
            status: { in: ["paid", "payment_due"] },
            "sort_by[desc]": "date"
          })
          .request(function (
            error: unknown,
            result: { list: Array<{ invoice: Record<string, unknown> }> }
          ) {
            if (error) {
              reject(error);
            } else {
              accept(result.list.map((entry) => entry.invoice));
            }
          });
      });

    const invoice = findInvoiceContainingDate({
      date: DateTime.fromISO(payload.pause_start_date).startOf("day"),
      invoices,
    });

    const responseData = {
      invoice: invoice
    }

    return returnOkResponse(responseData)
  } catch (error) {
    return returnErrorResponse(error)
  }
}
