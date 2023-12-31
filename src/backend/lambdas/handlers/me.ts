import {
  returnOkResponse,
  returnErrorResponse,
  protectRoute,
} from "@tnmo/core-backend";

import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getUserFromAws } from "../../../utils/get-user-from-aws";
import { warmer } from "../../utils/warmer";

export const handler = warmer<APIGatewayProxyHandlerV2>(async (event) => {
  try {
    const { username } = await protectRoute(event);
    const user = await getUserFromAws(username);

    return returnOkResponse(user);
  } catch (error) {
    return returnErrorResponse(error);
  }
});
