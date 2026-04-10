import "../../utils/init-dd-trace";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { handleWebhookTest } from "./handle-webhook-test";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  return handleWebhookTest(event);
};
