import "../../utils/init-dd-trace";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { ENV } from "@tnmo/constants";
import { handleWebhookProd } from "./handle-webhook-prod";
import { handleWebhookTest } from "./handle-webhook-test";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const environment = process.env[ENV.varNames.EnvironmentName];
  return environment === "prod"
    ? handleWebhookProd(event)
    : handleWebhookTest(event);
};
