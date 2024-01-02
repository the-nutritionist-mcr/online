import "dotenv/config";

import { CHARGEBEE, ENV } from "@tnmo/constants";
import { ChargeBee } from "chargebee-typescript";

const key = process.env[ENV.varNames.ChargeBeeToken];

export const chargebee = new ChargeBee();

chargebee.configure({
  site: CHARGEBEE.sites.test,
  api_key: key,
});
