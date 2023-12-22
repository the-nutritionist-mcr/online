---
id: make-api-route
title: How to make an API route
tags:
  - API
  - Lambda
  - API Gateway
  - CDK

description: How to setup a new API route
---

The steps to creating a new API route are as follows

## Create the handler function

This should be a Typescript module living in `src/backend/lambda/handlers`. The module should export a single function called `handler`, which looks like this:

```TypeScript
import { APIGatewayProxyEventV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
   // Some code
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
