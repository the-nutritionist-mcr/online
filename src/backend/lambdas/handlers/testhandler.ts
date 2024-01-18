import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import {
  protectRoute,
  returnOkResponse,
  returnErrorResponse,
} from "@tnmo/core-backend";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await protectRoute(event)


    // Some code that possible creates this responseData object

    const responseData = {
      hello: "world"
    }

    return returnOkResponse(responseData)
  } catch(error) {
    return returnErrorResponse(error)
  }
}