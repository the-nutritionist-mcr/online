import { HTTP } from "@tnmo/constants";
import { setErrorOnServiceEntrySpan } from "../backend/utils/init-dd-trace";
import { HttpError } from "@tnmo/core";

/**
 * Parse an error thrown by application code and return a response object that can be returned by a lambda
 *
 * @param error - The thrown error
 */
export const returnErrorResponse = (error?: Error | unknown) => {
  const stack =
    !(error instanceof Error) ||
    process.env["ENVIRONMENT_NAME"] === "prod" ||
    !error
      ? {}
      : { stack: error.stack };

  const statusCode =
    error instanceof HttpError
      ? error.statusCode
      : HTTP.statusCodes.InternalServerError;

  if (error instanceof Error) {
    setErrorOnServiceEntrySpan(error);
  }

  console.log(error);

  const errorObj =
    error && error instanceof Error ? { error: error.message } : {};

  return {
    body: JSON.stringify({ ...errorObj, ...stack }),
    statusCode,
    headers: {
      [HTTP.headerNames.AccessControlAllowOrigin]: "*",
      [HTTP.headerNames.AccessControlAllowHeaders]: "*",
    },
  };
};
