import { HTTP } from "@tnmo/constants";
import { HttpError } from "@tnmo/core";
import { APIGatewayProxyEventV2 } from "aws-lambda";

const decodeBasicAuth = (authHeaderValue: string) => {
  const base64Encoded = authHeaderValue.split(" ")[1];
  const parts = Buffer.from(base64Encoded, "base64")
    .toString("utf8")
    .split(":");

  const username = parts[0];
  const [, ...passwordParts] = parts;

  return {
    username,
    password: passwordParts.join(""),
  };
};

export const authoriseBasic = (
  event: APIGatewayProxyEventV2,
  username: string,
  password: string
) => {
  const credentials = decodeBasicAuth(
    event.headers[HTTP.headerNames.Authorization] ?? ""
  );

  if (credentials.username !== username || credentials.password !== password) {
    throw new HttpError(
      HTTP.statusCodes.Forbidden,
      `Basic authentication failed`
    );
  }
};
