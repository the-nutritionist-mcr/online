import "../../utils/init-dd-trace";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { handleWebhookUpdated } from "./handle-webhook-updated";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  return handleWebhookUpdated(event);
};
