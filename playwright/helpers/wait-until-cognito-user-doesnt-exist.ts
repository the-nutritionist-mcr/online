import { ENV } from "@tnmo/constants";
import { doesCognitoUserExist } from "./does-cognito-user-exist";

export const waitUntilCognitoUserDoesntExist = async (username: string) => {
  const exists = async () => {
    const pool = process.env[ENV.varNames.CognitoPoolId] ?? "";
    return await doesCognitoUserExist(username, pool);
  };

  const result = await exists();

  if (result) {
    console.log("User was found");
    await new Promise((accept) => setTimeout(accept, 2000));
    await waitUntilCognitoUserDoesntExist(username);
  } else {
    console.log("User not found");
  }

  return null;
};
