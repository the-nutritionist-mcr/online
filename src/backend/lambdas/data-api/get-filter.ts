import "../../utils/init-dd-trace";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { protectRoute } from "../../../core-backend/protect-route";

import { returnErrorResponse } from "../../../core-backend/return-error-response";
import { scan } from "./get-data/scan";
import { returnOkResponse } from "../../../core-backend/return-ok-response";
import Fuse from "fuse.js";
import { warmer } from "../../utils/warmer";

export const handler = warmer<APIGatewayProxyHandlerV2>(async (event) => {
  try {
    await protectRoute(event, ["admin"]);

    const searchTerm = event.queryStringParameters?.searchTerm;

    const dynamodb = new DynamoDBClient({});
    const client = DynamoDBDocumentClient.from(dynamodb);

    const items = await scan(client, process.env["DYNAMODB_TABLE"] ?? "");

    const withoutDeleted = items.filter((item) => !item.deleted);

    const fuse = new Fuse(withoutDeleted, {
      keys: ["name", "shortName", "description"],
    });

    const body = {
      items: searchTerm
        ? fuse.search(searchTerm).map((result) => result.item)
        : withoutDeleted,
    };

    return returnOkResponse(body);
  } catch (error) {
    return returnErrorResponse(error);
  }
});
