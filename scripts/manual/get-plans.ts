import { getPlans } from "../../src/backend/utils/get-plans";
import { ChargeBee } from "chargebee-typescript";

const defaultCustomerId = "198QFrU4kV1iM2AeE";
const defaultSite = "thenutritionist";

const customerId = process.env.CHARGEBEE_CUSTOMER_ID ?? defaultCustomerId;
const site = process.env.CHARGEBEE_SITE ?? defaultSite;
const apiKey = process.env.CHARGEBEE_TOKEN;

if (!apiKey) {
  throw new Error("CHARGEBEE_TOKEN must be set");
}

const chargebee = new ChargeBee();

chargebee.configure({
  api_key: apiKey,
  site,
});

const main = async () => {
  console.log(`Fetching plans for Chargebee customer ${customerId} on ${site}`);

  const plans = await getPlans(chargebee, customerId);

  console.log(`getPlans returned ${plans.length} plan(s):`);
  console.log(JSON.stringify(plans, null, 2));
};

main().catch((error: unknown) => {
  console.error("getPlans manual check failed");

  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});
