import { mock } from "vitest-mock-extended";
import { handler } from "./put";

import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEventV2, EventBridgeEvent } from "aws-lambda";
import { protectRoute } from "@tnmo/core-backend";
import { HttpError } from "@tnmo/core";
import { HTTP } from "../../../infrastructure/constants";

const dynamodbMock = mockClient(DynamoDBDocumentClient);

vi.mock("@tnmo/core-backend");

beforeEach(() => {
  vi.resetAllMocks();
  dynamodbMock.reset();
  delete process.env["DYNAMODB_TABLE"];
});

describe("the get handler", () => {
  it("returns a response with the statuscode from the error when an httpError is thrown by authorise", async () => {
    vi.mocked(protectRoute).mockRejectedValue(
      new HttpError(HTTP.statusCodes.Forbidden, "oh no!")
    );

    process.env["DYNAMODB_TABLE"] = "foo-table";

    const inputItem = {
      foo: "baz",
    };

    const mockInput = mock<
      APIGatewayProxyEventV2 & EventBridgeEvent<string, unknown>
    >();

    mockInput.body = JSON.stringify(inputItem);

    const response = await handler(mockInput, mock(), mock());

    expect(response).toEqual(
      expect.objectContaining({ statusCode: HTTP.statusCodes.Forbidden })
    );
  });

  it("calls dynamodb putItem with input object and returns success", async () => {
    process.env["DYNAMODB_TABLE"] = "foo-table";

    vi.mocked(protectRoute).mockResolvedValue(mock());

    const inputItem = {
      foo: "baz",
    };

    const mockInput = mock<
      APIGatewayProxyEventV2 & EventBridgeEvent<string, unknown>
    >();

    mockInput.body = JSON.stringify(inputItem);

    const response = await handler(mockInput, mock(), mock());

    const calls = dynamodbMock.commandCalls(PutCommand, {
      TableName: "foo-table",
      Item: { ...inputItem },
      ConditionExpression: "attribute_exists(id)",
    });

    expect(calls).toHaveLength(1);

    expect(response).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify({}),

      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
      },
    });
  });
});
