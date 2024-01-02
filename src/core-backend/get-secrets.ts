import {
  SecretsManagerClient,
  GetSecretValueCommand,
  GetSecretValueCommandInput,
} from "@aws-sdk/client-secrets-manager"; // ES Modules import

const client = new SecretsManagerClient({});

/**
 * Get secrets from AWS Secrets Manager
 *
 * @param secretNames - names of secrets to get. This argument is variadic, so you can pass in as many secrets as you like
 */
export const getSecrets = (...secretNames: string[]) =>
  secretNames.map(async (secret) => {
    const input: GetSecretValueCommandInput = {
      SecretId: secret,
    };

    const response = await client.send(new GetSecretValueCommand(input));

    return response.SecretString;
  });
