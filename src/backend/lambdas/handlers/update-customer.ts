import "../../utils/init-dd-trace";
import {
  AdminUpdateUserAttributesCommandInput,
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { isUpdateCustomerBody } from "@tnmo/types";
import { ENV, HTTP, COGNITO } from "@tnmo/constants";
import {
  returnOkResponse,
  returnErrorResponse,
  protectRoute,
} from "@tnmo/core-backend";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { HttpError } from "../data-api/http-error";
import { warmer } from "../../utils/warmer";

export const handler = warmer<APIGatewayProxyHandlerV2>(async (event) => {
  try {
    await protectRoute(event, ["admin"]);
    const cognito = new CognitoIdentityProviderClient({});
    const poolId = process.env[ENV.varNames.CognitoPoolId];

    const username = event.pathParameters?.username;

    const body = JSON.parse(event.body ?? "");

    if (!username || !isUpdateCustomerBody(body)) {
      throw new HttpError(HTTP.statusCodes.BadRequest, "Request was invalid");
    }

    const input: AdminUpdateUserAttributesCommandInput = {
      UserPoolId: poolId,
      Username: username,
      UserAttributes: [
        {
          Name: `custom:${COGNITO.customAttributes.CustomPlan}`,
          Value: JSON.stringify(body.customPlan) ?? "",
        },
        {
          Name: `custom:${COGNITO.customAttributes.UserCustomisations}`,
          Value: JSON.stringify(body.customisations),
        },
      ],
    };

    await cognito.send(new AdminUpdateUserAttributesCommand(input));

    return returnOkResponse({});
  } catch (error) {
    return returnErrorResponse(error);
  }
});
