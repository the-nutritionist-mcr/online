import {
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { COGNITO, ENV } from "@tnmo/constants";
import { ChargeBee } from "chargebee-typescript";
import { getPlans } from "../utils/get-plans";
import { reloadCustomerPlans } from "../utils/reload-customer-plans";

export const handleSubscriptionEvent = async (
  client: ChargeBee,
  customerId: string
) => {
  await reloadCustomerPlans(client, customerId);
};
