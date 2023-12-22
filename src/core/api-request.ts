import { currentUser } from "./aws/authenticate";
import { getAppConfig } from "./get-app-config";
import { HttpError } from "./http-error";
import { HttpStatusCodes } from "./http-codes";

const getFetchInit = async (init?: RequestInit) => {
  const user = await currentUser();
  if (!user) {
    return {};
  }
  const {
    signInUserSession: {
      accessToken: { jwtToken },
    },
  } = user;

  const withToken = {
    headers: {
      authorization: jwtToken,
    },
  };

  return init ? { ...init, ...withToken } : withToken;
};

export const apiRequest = async <T>(
  path: string,
  init?: RequestInit,
  auth = true
): Promise<T> => {
  const { ApiDomainName: domainName } = await getAppConfig();

  const finalInit = auth ? await getFetchInit(init) : init;
  const fullPath = `https://${domainName}/${path}`;
  const response = await fetch(fullPath, finalInit);

  const data = await response.json();

  if (!response.ok) {
    const error = new HttpError(
      response.status as HttpStatusCodes,
      `Tried to make a request to ${fullPath} but the server returned a ${response.status} status code with the message "${data.error}"`
    );
    throw error;
  }
  return data;
};
