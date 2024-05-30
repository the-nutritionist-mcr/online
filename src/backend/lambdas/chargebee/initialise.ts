import "dotenv/config";

import { ENV } from "@tnmo/constants";
import { ChargeBee } from "chargebee-typescript";
import { getEnv, getSecrets } from '@tnmo/core-backend';

export const getChargebeeClient = async (): Promise<ChargeBee> => {
  const chargebee = new ChargeBee();

  const [chargebeeToken] =
    getSecrets(
      getEnv(ENV.varNames.ChargeBeeToken),
    );

  const apiKey = await chargebeeToken;

  chargebee.configure({
    site: process.env[ENV.varNames.ChargeBeeSite],
    api_key: apiKey,
  });

  return chargebee;
}