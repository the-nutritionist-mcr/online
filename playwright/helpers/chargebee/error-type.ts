import { z } from "zod";

export const chargebeeErrorType = z.object({
  message: z.string(),
  type: z.string(),
  api_error_code: z.string(),
  error_code: z.string(),
  error_msg: z.string(),
  http_status_code: z.number(),
});
