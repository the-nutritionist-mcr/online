import "../../utils/init-dd-trace";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"; // ES6 import
import { ENV, HTTP } from "@tnmo/constants";
import { HttpError } from "../data-api/http-error";
import { isPublishPlanBody } from "@tnmo/types";
import {
  returnOkResponse,
  returnErrorResponse,
  protectRoute,
} from "@tnmo/core-backend";
import { warmer } from "../../utils/warmer";

export const handler = warmer<APIGatewayProxyHandlerV2>(async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const dynamodbClient = new DynamoDBClient({});
    const client = DynamoDBDocumentClient.from(dynamodbClient); // client is DynamoDB client

    const publishPlanBody = JSON.parse(event.body ?? "");
    const tableName = process.env[ENV.varNames.DynamoDBTable];

    if (!isPublishPlanBody(publishPlanBody)) {
      throw new HttpError(HTTP.statusCodes.BadRequest, "Request was invalid");
    }

    const updateCommand = new UpdateCommand({
      TableName: tableName,
      Key: {
        id: publishPlanBody.id,
        sort: publishPlanBody.sort,
      },
      UpdateExpression: `SET published = :published`,
      ExpressionAttributeValues: {
        ":published": true,
      },
    });

    await client.send(updateCommand);
    return returnOkResponse({});
  } catch (error) {
    return returnErrorResponse(error);
  }
});
