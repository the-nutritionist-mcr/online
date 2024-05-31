import randomString from "randomstring";
import {
  returnOkResponse,
  returnErrorResponse,
  protectRoute,
} from "@tnmo/core-backend";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminSetUserPasswordCommand,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  SendEmailCommand,
  SendEmailCommandInput,
  SESClient,
} from "@aws-sdk/client-ses";
import { getUserFromAws } from "../../../utils/get-user-from-aws";
import { makeEmail } from "../../utils/portal-welcome-email";
import { getDomainName } from "@tnmo/utils";
import { warmer } from "../../utils/warmer";
import { HttpError } from "../data-api/http-error";
import { HTTP } from "@tnmo/constants";

export interface ResetPassswordPayload {
  username: string;
  generateNew?: boolean;
  newPassword?: string;
  forceChange?: boolean;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const { authenticated } = await protectRoute(event, ["admin"], {
      allowUnauthenticated: true,
    });

    const body = JSON.parse(event.body ?? "{}");

    const cognito = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
    });

    const getUsernameFromEmail = async (email: string): Promise<string> => {
      const params = {
        UserPoolId: process.env["COGNITO_POOL_ID"],
        Limit: 1,
        // eslint-disable-next-line no-useless-escape
        Filter: `email ^= \"${email.trim()}\"`,
      };

      const command = new ListUsersCommand(params);

      const response = await cognito.send(command);

      if (!response.Users || response.Users?.length !== 1) {
        throw new HttpError(
          HTTP.statusCodes.BadRequest,
          `User with email ${email} was not found`
        );
      }

      return response.Users[0].Username ?? "";
    };

    const username = authenticated
      ? body.username
      : await getUsernameFromEmail(body.username);

    const password = !body.generateNew
      ? body.newPassword
      : randomString.generate(8);

    const user = await getUserFromAws(username);

    const forceChange = authenticated ? body.forceChange : true;

    const ses = new SESClient({});

    const command = new AdminSetUserPasswordCommand({
      UserPoolId: process.env.COGNITO_POOL_ID,
      Username: username,
      Password: password,
      Permanent: !forceChange,
    });

    await cognito.send(command);

    const domainName = getDomainName(process.env.ENVIRONMENT_NAME ?? "");

    const email: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [user.email],
      },
      Message: {
        Body: {
          Html: {
            // eslint-disable-next-line unicorn/text-encoding-identifier-case
            Charset: "UTF-8",
            Data: makeEmail(
              user.firstName,
              user.username ?? "",
              password,
              `https://${domainName}`
            ),
          },
        },
        Subject: {
          // eslint-disable-next-line unicorn/text-encoding-identifier-case
          Charset: "UTF-8",
          Data: "Welcome to your personal Members Area",
        },
      },
      Source: "no-reply@thenutritionistmcr.com",
    };

    const sendEmailCommand = new SendEmailCommand(email);

    await ses.send(sendEmailCommand);

    return returnOkResponse({});
  } catch (error) {
    if (error instanceof Error) {
      return returnErrorResponse(error);
    }
    return returnErrorResponse();
  }
};
