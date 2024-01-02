import "../../utils/init-dd-trace";
import { ENV } from "@tnmo/constants";
import {
  returnOkResponse,
  returnErrorResponse,
  protectRoute,
} from "@tnmo/core-backend";

import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAllUsers } from "../../dynamodb/get-all-users";
import { warmer } from "../../utils/warmer";

export const handler = warmer<APIGatewayProxyHandlerV2>(async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const poolId = process.env[ENV.varNames.CognitoPoolId];

    const users = await getAllUsers(poolId ?? "");

    return returnOkResponse({
      users,
    });
  } catch (error) {
    return error instanceof Error
      ? returnErrorResponse(error)
      : returnErrorResponse();
  }
});
