import { HTTP } from "@tnmo/constants";
import { setErrorOnServiceEntrySpan } from "../backend/utils/init-dd-trace";
import { HttpError } from "@tnmo/core";

/**
 * Parse an error thrown by application code and return a response object that can be returned by a lambda
 *
 * @param error - The thrown error
 */
export const returnErrorResponse = (
  error?: Error | unknown,
  context?: Record<string, unknown>
) => {
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

  const contextObj = context ? {} : context;

  const errorObj =
    error && error instanceof Error ? { error: error.message } : {};

  const bodyObject = { ...errorObj, ...stack, ...contextObj };

  console.log(bodyObject);

  return {
    body: JSON.stringify(bodyObject),
    statusCode,
    headers: {
      [HTTP.headerNames.AccessControlAllowOrigin]: "*",
      [HTTP.headerNames.AccessControlAllowHeaders]: "*",
    },
  };
};
