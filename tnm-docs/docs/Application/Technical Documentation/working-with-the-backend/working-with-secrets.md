---
id: working-with-secrets
title: Working with secrets
tags:
  - Secrets
  - AWS Secrets Manager
  - CDK
  - IAC

description: How to correctly use secrets in your backend functions
---

Application secrets are managed using [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/). In order to use secrets correctly in your backend functions, you'll need to do the following

## Create a unique identifier for your secret in a separate file

This is a simple TypeScript module that looks like this

```TypeScript
export const secretName = `a-unique-name-for-your-secret`
```

## Create the infrastructure

Assuming you've already [created an API route](./create-an-api-route.md), in the same file, add the following

```TypeScript
  import { secretName } from "./wherever-you-put-it/secret-name"

  const myApiKey = new Secret(
    context,
    secretName,
    {
      secretName: getResourceName(secretName, envName),
    }
  );

  const myFunction = makeFunction({
    /** However else you chose to set this function up **/
    environment: {
        [secretName]: myApiKey.secretName
    }
  )

  myFunction.grantRead(myApiKey)
```

This will do the following

- Create a secret resource in AWS associated with this stack
- Supply an environment variable to the function with the real name of that secret
- Grant your function acccess to read that secret

We do it like this so that each stack has its own unique set of secrets; meaning we can easily associate different environments with different tokens.

## Add the secret value

Once you make the above changes and deploy it, you'll have some 'secret' resources created that are available in the AWS console. At present, they will have randomly generated values in them. You'll need to login to the AWS console and update them to the correct values.

## Get the secret at runtime

To get access to that secret in your [lambda handler](./create-an-api-route.md#create-the-handler-function), do the following:

```TypeScript
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { getEnv, getSecrets } from "@tnmo/core-backend";

import { secretName } from "./wherever-you-put-it/secret-name"

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    // Boilerplate + your own code

    // getSecrets is a variadic function - so if you supply a second argument, the second item
    // in the response array will be another promise
    const [secretValuePromise] = getSecrets(getEnv(secretName))

    const secretValue = await secretValuePromise

    // Boilerplate
}
```
