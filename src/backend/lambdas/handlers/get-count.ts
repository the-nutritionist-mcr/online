import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ENV, HTTP } from "@tnmo/constants";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import {
  returnOkResponse,
  returnErrorResponse,
  protectRoute,
} from "@tnmo/core-backend";

import { HttpError } from "../data-api/http-error";
import "../../utils/init-dd-trace";
import { warmer } from "../../utils/warmer";

export const handler = warmer<APIGatewayProxyHandlerV2>(async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const dynamodbClient = new DynamoDBClient({});
    const client = DynamoDBDocumentClient.from(dynamodbClient);
    const tableName = process.env[ENV.varNames.DynamoDBTable];

    const command = new GetCommand({
      TableName: tableName ?? "",
      Key: { id: "count" },
    });

    const response = await client.send(command);

    const count = response.Item?.count;

    if (!count) {
      throw new HttpError(
        HTTP.statusCodes.InternalServerError,
        "No count found :-("
      );
    }

    return returnOkResponse({ count });
  } catch (error) {
    return returnErrorResponse(error);
  }
});
