import "dotenv/config";

import { CHARGEBEE, ENV } from "@tnmo/constants";
import { ChargeBee } from "chargebee-typescript";

// hard-coded 😬
const apiKey = 'test_CS08g7ecuXZ9jWecuEnilZiPEwyADjDZfi'; 
// process.env[ENV.varNames.ChargeBeeToken];

export const chargebee: ChargeBee = new ChargeBee();

chargebee.configure({
  site: CHARGEBEE.sites.test,
  api_key: apiKey,
});
