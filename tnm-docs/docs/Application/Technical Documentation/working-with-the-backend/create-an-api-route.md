---
id: create-an-api-route
title: Create an API route
tags:
  - API
  - Lambda
  - API Gateway
  - CDK

description: How to setup API routes
---

Backend execution is handled by [AWS Lambda](https://aws.amazon.com/lambda/) and deployed using the [aws CDK](https://aws.amazon.com/cdk/) - an IAC framework that allows me to declare all the infrastructure as TypeScript. That means setting up new infrastructure is as simple as adding a few lines of TypeScript code.

## Create the handler function

:::warning
If you do not call **protectRoute** at the start of your handler, your API will be available for **anyone on the internet to call regardless if they are logged in or not**
:::

This should be a Typescript module living in `src/backend/lambda/handlers`. The module should export a single function called `handler`, which looks like this:

```TypeScript
import { APIGatewayProxyEventV2 } from "aws-lambda";

import {
  protectRoute,
  returnOkResponse,
  returnErrorResponse,
} from "@tnmo/core-backend";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await protectRoute(event)


    // Some code that possible creates this responseData object

    const responseData = {
      hello: "world"
    }

    return returnOkResponse(responseData)
  } catch(error) {
    return returnErrorResponse(error)
  }
}
```

## Set up the infrastructure

Add the following to `src/infrastructure/make-data-apis.ts`

```TypeScript
// Create the lambda function
const yourFunction = makeFunction(`an-id-string`, {
  entry: entryName("handlers", "your-file-name.ts"),
  environment: defaultEnvironmentVars,
});

// Create https://api.portal.thenutritionistmcr.com/your-api-path
const yourApiResource = api.root.addResource(
  "your-api-path"
);

// Make `/your-api-path` called with a GET request trigger your lambda function
yourApiResource.addMethod(
  "GET",
  new LambdaIntegration(yourFunction)
);
```

Once this is deployed, your API function will be available!

## How to request data from the backend

To request data from the API route you've just setup, call the `apiRequest` function exported from `@tnmo/core`. This function will automatically

- Call the correct API URL depending on what environment you are in
- Supply the correct backend token for the currently logged in user

```TypeScript

import { apiRequest } from "@tnmo/core"

const yourAsyncFunction = async () => {

  const data = await apiRequest<ExpectedResponseType>("your-api-path", {
    method: "POST",
    body: JSON.stringify({ some: "data" })
  })

  // Do something with the data
}

```
