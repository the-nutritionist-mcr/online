import { HttpStatusCodes } from "./http-codes";

export class HttpError extends Error {
  public constructor(
    public readonly statusCode: HttpStatusCodes,
    message: string
  ) {
    super(message);
  }
}
