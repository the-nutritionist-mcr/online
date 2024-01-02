import { verifyJwtToken } from "@tnmo/authorise-cognito-jwt";
import { APIGatewayProxyEventV2 } from "aws-lambda";

import { HTTP } from "../infrastructure/constants";
import { HttpError } from "@tnmo/core";

interface AuthoriseResponse {
  username: string;
  groups: ReadonlyArray<string>;
  firstName: string;
  surname: string;
  authenticated: boolean;
}

/**
 * Validate the JWT token in the authorization header of the request. If the token is valid, return the user's username and Cognito groups encoded in the claim.
 * If you wish to limit a route to only users in certain groups, pass the groups as the second arguments.
 *
 * @param event - The event object from the lambda handler
 * @param groups - The groups that the user must be a member of to be authorised
 */
export const protectRoute = async (
  event: APIGatewayProxyEventV2,
  groups?: string[],
  options?: { allowUnauthenticated: boolean }
): Promise<AuthoriseResponse> => {
  const authHeader =
    event.headers &&
    Object.entries(event.headers).find(
      (pair) => pair[0].toLowerCase() === "authorization"
    )?.[1];

  if (!authHeader && options?.allowUnauthenticated) {
    return {
      authenticated: false,
      username: "",
      groups: [],
      firstName: "",
      surname: "",
    };
  }

  if (!authHeader) {
    throw new HttpError(
      HTTP.statusCodes.Forbidden,
      "Request didn't contain an authorization header"
    );
  }

  const verifyResult = await verifyJwtToken({
    token: authHeader,
    authorisedGroups: groups,
  });

  if (!verifyResult.isValid) {
    throw new HttpError(
      HTTP.statusCodes.Forbidden,
      `Token validation failed: ${verifyResult.error?.message}`
    );
  }

  return {
    authenticated: true,
    username: verifyResult.userName,
    groups: verifyResult.groups,
    firstName: verifyResult.firstName,
    surname: verifyResult.surname,
  };
};
