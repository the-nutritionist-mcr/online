import {
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { COGNITO, ENV } from "@tnmo/constants";
import { ChargeBee } from "chargebee-typescript";
import { getPlans } from "../utils/get-plans";

export const reloadCustomerPlans = async (
  client: ChargeBee,
  customerId: string
) => {
  console.log("Reloading customer plans", { customerId });
  const poolId = process.env[ENV.varNames.CognitoPoolId];

  try {
    console.log("Fetching plans from Chargebee", { customerId });
    const plans = await getPlans(client, customerId);
    console.log("Fetched plans from Chargebee", {
      customerId,
      planCount: plans.length,
      planIds: plans.map((plan) => plan.id),
    });

    const input: AdminUpdateUserAttributesCommandInput = {
      UserPoolId: poolId,
      Username: customerId,
      UserAttributes: [
        {
          Name: `custom:${COGNITO.customAttributes.Plans}`,
          Value: JSON.stringify(plans),
        },
        {
          Name: `custom:${COGNITO.customAttributes.SubscriptionUpdateTimestamp}`,
          Value: String(Date.now() / 1000),
        },
      ],
    };

    const command = new AdminUpdateUserAttributesCommand(input);

    const cognito = new CognitoIdentityProviderClient({});

    console.log("Updating Cognito customer plan attributes", {
      customerId,
      poolId,
      attributeNames: input.UserAttributes?.map((attribute) => attribute.Name),
    });

    await cognito.send(command);

    console.log("Updated Cognito customer plan attributes", {
      customerId,
      poolId,
    });
  } catch (error) {
    console.error("Failed to reload customer plans", {
      customerId,
      poolId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};
