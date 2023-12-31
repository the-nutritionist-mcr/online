import "../../utils/init-dd-trace";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { returnErrorResponse, protectRoute } from "@tnmo/core-backend";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  CustomerMealsSelectionWithChargebeeCustomer,
  isChangePlanRecipeBody,
} from "@tnmo/types";
import { HttpError } from "../data-api/http-error";
import { ENV, HTTP } from "@tnmo/constants";
import { updateDelivery } from "@tnmo/utils";
import { warmer } from "../../utils/warmer";

export const handler = warmer<APIGatewayProxyHandlerV2>(async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const marshallOptions = {
      removeUndefinedValues: true,
    };

    const dynamodbClient = new DynamoDBClient({});
    const changePlanData = JSON.parse(event.body ?? "");
    const tableName = process.env[ENV.varNames.DynamoDBTable];

    if (!isChangePlanRecipeBody(changePlanData)) {
      throw new HttpError(HTTP.statusCodes.BadRequest, "Request was invalid");
    }

    const dynamo = DynamoDBDocumentClient.from(dynamodbClient, {
      marshallOptions,
    });

    const queryCommand = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: `id = :id and sort = :sort`,
      ExpressionAttributeValues: {
        ":id": changePlanData.selectionId,
        ":sort": changePlanData.selectionSort,
      },
    });

    const result = await dynamo.send(queryCommand);

    const selection: CustomerMealsSelectionWithChargebeeCustomer[number] =
      result.Items?.[0].selection;

    const newSelection: CustomerMealsSelectionWithChargebeeCustomer[number] = {
      customer: selection.customer,
      deliveries: updateDelivery(selection.deliveries, changePlanData),
    };

    const putCommand = new PutCommand({
      TableName: tableName,
      Item: {
        id: changePlanData.selectionId,
        sort: changePlanData.selectionSort,
        selection: newSelection,
      },
    });

    await dynamo.send(putCommand);

    return {
      statusCode: HTTP.statusCodes.Ok,
      body: "{}",
      headers: {
        [HTTP.headerNames.AccessControlAllowOrigin]: "*",
        [HTTP.headerNames.AccessControlAllowHeaders]: "*",
      },
    };
  } catch (error) {
    return returnErrorResponse(error);
  }
});
