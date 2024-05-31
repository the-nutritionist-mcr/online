import {
  returnOkResponse,
  returnErrorResponse,
  protectRoute,
} from "@tnmo/core-backend";

import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getUserFromAws } from "../../../utils/get-user-from-aws";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const { username } = await protectRoute(event);
    const user = await getUserFromAws(username);

    return returnOkResponse(user);
  } catch (error) {
    return returnErrorResponse(error);
  }
};
