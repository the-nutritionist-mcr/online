import { HTTP } from "@tnmo/constants";
import { allowHeaders } from "../backend/allow-headers";

/**
 * Create a response object with the given body that can be returned from a lambda
 *
 * @param body - the body of the response
 * @returns
 */
export const returnOkResponse = <T>(body: T) => {
  return {
    statusCode: HTTP.statusCodes.Ok,
    body: JSON.stringify(body),
    headers: {
      [HTTP.headerNames.AccessControlAllowOrigin]: "*",
      [HTTP.headerNames.AccessControlAllowHeaders]: allowHeaders.join(", "),
    },
  };
};
