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

    // const id = '77ECsTyblGXbD2P'; 
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



// chargebee customer: {
//   "id": "77ECsTyblGXbD2P",
//   "first_name": "Addy",
//   "last_name": "Palmer",
//   "email": "adam@thenutritionistmcr.com",
//   "auto_collection": "on",
//   "net_term_days": 0,
//   "allow_direct_debit": false,
//   "created_at": 1702732791,
//   "created_from_ip": "77.97.132.147",
//   "taxability": "taxable",
//   "updated_at": 1705673191,
//   "locale": "en",
//   "pii_cleared": "active",
//   "channel": "web",
//   "resource_version": 1705673191326,
//   "deleted": false,
//   "object": "customer",
//   "billing_address": {
//     "first_name": "Adamus",
//     "last_name": "Palmer",
//     "email": "adam@thenutritionistmcr.com",
//     "company": "The Nutritionist",
//     "phone": "+44075153566235",
//     "line1": "64 Strawberry Fields",
//     "city": "Liverpool",
//     "country": "GB",
//     "zip": "L26 7FJ",
//     "validation_status": "not_validated",
//     "object": "billing_address"
//   },
//   "card_status": "valid",
//   "promotional_credits": 0,
//   "refundable_credits": 0,
//   "excess_payments": 0,
//   "unbilled_charges": 0,
//   "preferred_currency_code": "GBP",
//   "mrr": 0,
//   "primary_payment_source_id": "pm_BTLzEhTyby5JOEX7",
//   "payment_method": {
//     "object": "payment_method",
//     "type": "card",
//     "reference_id": "tok_BTLzEhTyby5JCEX6",
//     "gateway": "chargebee",
//     "gateway_account_id": "gw_199LVfSrH8SXXo",
//     "status": "valid"
//   },
//   "tax_providers_fields": [],
//   "cf_cook_1_delivery_day": "Monday",
//   "cf_cook_2_delivery_day": "Friday",
//   "cf_number_of_bags": 4
// }