import { CfnOutput, Duration } from "aws-cdk-lib";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGatewayDomain } from "aws-cdk-lib/aws-route53-targets";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { IHostedZone } from "aws-cdk-lib/aws-route53";
import { getResourceName } from "./get-resource-name";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { getDomainName } from "@tnmo/utils";
import { IUserPool } from "aws-cdk-lib/aws-cognito";
import { IAM, ENV, HTTP, RESOURCES, NODE_OPTS } from "@tnmo/constants";
import { makeDataApi } from "./make-data-api";
import { entryName } from "./entry-name";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { allowHeaders } from "../backend/allow-headers";
import { makeInstrumentedFunctionGenerator } from "./instrumented-nodejs-function";

export const makeDataApis = (
  context: Construct,
  envName: string,
  pool: IUserPool,
  hostedZone: IHostedZone,
  gitHash: string | undefined,
  sesIdentityArn: string,
  chargebeeSite: string,
  forceUpdateKey: string
) => {
  const domainName = getDomainName(envName, "api");

  const chargebeeAccessToken = new Secret(context, "ChargeeAccessToken", {
    secretName: getResourceName(`chargebee-access-token`, envName),
  });

  chargebeeAccessToken.secretName

  const chargeBeeWebhookUsername = new Secret(
    context,
    "ChargeBeeWebhookUsername",
    {
      secretName: getResourceName(`chargebee-webhook-username`, envName),
    }
  );

  const chargeWebhookPassword = new Secret(
    context,
    "ChargeBeeWebhookPassword",
    {
      secretName: getResourceName(`chargebee-webhook-password`, envName),
    }
  );

  const defaultEnvironmentVars = {
    [ENV.varNames.NodeOptions]: NODE_OPTS.EnableSourceMaps,
    [ENV.varNames.EnvironmentName]: envName,
    [ENV.varNames.ChargeBeeToken]: chargebeeAccessToken.secretName,
    [ENV.varNames.CognitoPoolId]: pool.userPoolId,
    [ENV.varNames.ChargeBeeSite]: chargebeeSite,
    [ENV.varNames.ChargeBeeWebhookUsername]:
      chargeBeeWebhookUsername.secretName,
    [ENV.varNames.ChargeBeeWebhookPasssword]: chargeWebhookPassword.secretName,
    FORCE_UPDATE_KEY: forceUpdateKey,
  };

  new CfnOutput(context, "ApiDomainName", {
    value: domainName,
  });

  const api = new RestApi(context, "data-api", {
    restApiName: getResourceName("data-api", envName),
    defaultCorsPreflightOptions: {
      allowHeaders,
      allowMethods: [
        HTTP.verbs.Get,
        HTTP.verbs.Put,
        HTTP.verbs.Post,
        HTTP.verbs.Options,
      ],
      allowCredentials: true,
      allowOrigins: ["*"],
    },
  });

  const { table: recipesTable } = makeDataApi(
    context,
    RESOURCES.Recipe,
    envName,
    gitHash,
    api,
    defaultEnvironmentVars
  );

  const { table: customisationsTable } = makeDataApi(
    context,
    RESOURCES.Customisation,
    envName,
    gitHash,
    api,
    defaultEnvironmentVars
  );

  const makeFunction = makeInstrumentedFunctionGenerator(
    context,
    envName,
    gitHash
  );

  if (envName === "cypress") {
    const seed = makeFunction(`seed-function`, {
      entry: entryName("handlers", "seed.ts"),
      timeout: Duration.minutes(15),
      environment: {
        ...defaultEnvironmentVars,
        RECIPES_TABLE: recipesTable.tableName,
        CUSTOMISATIONS_TABLE: customisationsTable.tableName,
      },
    });
    customisationsTable.grantReadWriteData(seed);
    recipesTable.grantReadWriteData(seed);
    const seedResource = api.root.addResource("seed");
    seedResource.addMethod("POST", new LambdaIntegration(seed));

    seed.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          IAM.actions.cognito.adminDeleteUser,
          IAM.actions.cognito.adminCreateUser,
          IAM.actions.cognito.adminSetUserPassword,
          IAM.actions.cognito.adminAddUserToGroup,
        ],
        resources: [pool.userPoolArn],
      })
    );
  }

  const planDataTable = new Table(context, `plan-table`, {
    tableName: getResourceName(`plan-table-table`, envName),
    billingMode: BillingMode.PAY_PER_REQUEST,
    partitionKey: {
      name: "id",
      type: AttributeType.STRING,
    },
    sortKey: {
      name: "sort",
      type: AttributeType.STRING,
    },
  });

  const listPlansFunction = makeFunction(`list-plans-function`, {
    entry: entryName("handlers", "list-recent-plans.ts"),
    environment: {
      ...defaultEnvironmentVars,
      [ENV.varNames.DynamoDBTable]: planDataTable.tableName,
    },
  });

  const planFunction = makeFunction(`plan-function`, {
    entry: entryName("handlers", "submit-full-plan.ts"),
    environment: {
      ...defaultEnvironmentVars,
      [ENV.varNames.DynamoDBTable]: planDataTable.tableName,
    },
  });

  const planResource = api.root.addResource("plan");

  const listResource = planResource.addResource("list");

  listResource.addMethod(
    HTTP.verbs.Get,
    new LambdaIntegration(listPlansFunction)
  );

  planDataTable.grantReadData(listPlansFunction);

  planResource.addMethod(HTTP.verbs.Post, new LambdaIntegration(planFunction));
  planDataTable.grantReadWriteData(planFunction);

  planFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [IAM.actions.cognito.listUsers],
      resources: [pool.userPoolArn],
    })
  );

  const getPlanFunction = makeFunction(`get-plan-function`, {
    entry: entryName("handlers", "get-current-plan.ts"),
    environment: {
      ...defaultEnvironmentVars,
      [ENV.varNames.DynamoDBTable]: planDataTable.tableName,
    },
  });

  const getOldPlanFunction = makeFunction(`get-old-plan-function`, {
    entry: entryName("handlers", "get-old-plan.ts"),
    environment: {
      ...defaultEnvironmentVars,
      [ENV.varNames.DynamoDBTable]: planDataTable.tableName,
    },
  });

  const oldPlan = planResource.addResource("{plan}");
  oldPlan.addMethod(HTTP.verbs.Get, new LambdaIntegration(getOldPlanFunction));
  planDataTable.grantReadData(getOldPlanFunction);

  planResource.addMethod(
    HTTP.verbs.Get,
    new LambdaIntegration(getPlanFunction)
  );
  planDataTable.grantReadData(getPlanFunction);

  const changePlanFunction = makeFunction(`change-plan-function`, {
    entry: entryName("handlers", "change-plan-recipe.ts"),
    environment: {
      ...defaultEnvironmentVars,
      [ENV.varNames.DynamoDBTable]: planDataTable.tableName,
    },
  });

  planResource.addMethod(
    HTTP.verbs.Put,
    new LambdaIntegration(changePlanFunction)
  );
  planDataTable.grantReadWriteData(changePlanFunction);

  const publishPlanFunction = makeFunction(`publish-plan-function`, {
    entry: entryName("handlers", "publish-plan.ts"),
    environment: {
      ...defaultEnvironmentVars,
      [ENV.varNames.DynamoDBTable]: planDataTable.tableName,
    },
  });

  const publishResource = planResource.addResource("publish");

  publishResource.addMethod(
    HTTP.verbs.Post,
    new LambdaIntegration(publishPlanFunction)
  );

  planDataTable.grantWriteData(publishPlanFunction);

  const customer = api.root.addResource("customer");

  const username = customer.addResource("{username}");

  const getCustomerFunction = makeFunction(`get-customer-function`, {
    entry: entryName("handlers", "get-customer.ts"),
    environment: defaultEnvironmentVars,
  });

  username.addMethod("GET", new LambdaIntegration(getCustomerFunction));

  getCustomerFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [IAM.actions.cognito.adminGetUser],
      resources: [pool.userPoolArn],
    })
  );

  const updateCustomerPlanFunction = makeFunction(
    `update-customer-plan-function`,
    {
      entry: entryName("handlers", "update-customer-plan.ts"),
      environment: {
        ...defaultEnvironmentVars,
        [ENV.varNames.DynamoDBTable]: planDataTable.tableName,
        [ENV.varNames.RecipesDynamoDBTable]: recipesTable.tableName,
      },
      memorySize: 2048,
    }
  );

  const resetPasswordFunction = makeFunction(`reset-password-function`, {
    entry: entryName("handlers", "reset-password.ts"),
    environment: defaultEnvironmentVars,
  });

  resetPasswordFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [IAM.actions.ses.sendEmail],
      resources: [sesIdentityArn],
    })
  );

  const resetPassword = customer.addResource("reset-password");

  resetPassword.addMethod("POST", new LambdaIntegration(resetPasswordFunction));

  resetPasswordFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        IAM.actions.cognito.adminSetUserPassword,
        IAM.actions.cognito.adminGetUser,
        IAM.actions.cognito.listUsers,
      ],
      resources: [pool.userPoolArn],
    })
  );

  updateCustomerPlanFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [IAM.actions.ses.sendEmail],
      resources: [sesIdentityArn],
    })
  );

  planFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [IAM.actions.cognito.adminGetUser],
      resources: [pool.userPoolArn],
    })
  );

  updateCustomerPlanFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [IAM.actions.cognito.adminGetUser],
      resources: [pool.userPoolArn],
    })
  );

  const updatePlanResource = customer.addResource("update-plan");

  updatePlanResource.addMethod(
    "PUT",
    new LambdaIntegration(updateCustomerPlanFunction)
  );

  planDataTable.grantReadWriteData(updateCustomerPlanFunction);
  recipesTable.grantReadData(updateCustomerPlanFunction);

  const updateCustomerFunction = makeFunction(`update-customer-function`, {
    entry: entryName("handlers", "update-customer.ts"),
    environment: defaultEnvironmentVars,
  });

  updateCustomerFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [IAM.actions.cognito.adminUpdateUserAttributes],
      resources: [pool.userPoolArn],
    })
  );

  username.addMethod("POST", new LambdaIntegration(updateCustomerFunction));

  const customers = api.root.addResource("customers");

  const getAllCustomersFunction = makeFunction(`get-all-customers-function`, {
    entry: entryName("handlers", "get-all-customers.ts"),
    environment: defaultEnvironmentVars,
  });

  customers.addMethod("GET", new LambdaIntegration(getAllCustomersFunction));

  getAllCustomersFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [IAM.actions.cognito.listUsers],
      resources: [pool.userPoolArn],
    })
  );

  const me = customers.addResource("me");

  const individualAcccessFunction = makeFunction(`chargebee-me-function`, {
    entry: entryName("handlers", "me.ts"),
    environment: defaultEnvironmentVars,
  });

  individualAcccessFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [pool.userPoolArn],
      actions: [IAM.actions.cognito.adminGetUser],
    })
  );

  chargebeeAccessToken.grantRead(individualAcccessFunction);

  me.addMethod("GET", new LambdaIntegration(individualAcccessFunction));

  const receiveChargebeeWebhook = api.root.addResource(
    "receive-chargebee-webhook"
  );

  const chargeBeeWebhookFunction = makeFunction(`chargebee-webhook-function`, {
    entry: entryName("handlers", "webhook.ts"),
    environment: { ...defaultEnvironmentVars, FORCE_DEPLOY: "true" },
  });

  chargeBeeWebhookUsername.grantRead(chargeBeeWebhookFunction);
  chargeWebhookPassword.grantRead(chargeBeeWebhookFunction);
  chargebeeAccessToken.grantRead(chargeBeeWebhookFunction);

  receiveChargebeeWebhook.addMethod(
    "POST",
    new LambdaIntegration(chargeBeeWebhookFunction)
  );

  chargeBeeWebhookFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        IAM.actions.cognito.adminGetUser,
        IAM.actions.cognito.adminCreateUser,
        IAM.actions.cognito.adminUpdateUserAttributes,
        IAM.actions.cognito.adminDeleteUser,
      ],
      resources: [pool.userPoolArn],
    })
  );


  // ***************
  // CHARGEBEE
  // ***************  

  // Get chargebee customer
  const chargebeeGetCustomerFunction = makeFunction(`chargebee-get-customer`, {
    entry: entryName("handlers", "chargebee-get-customer.ts"),
    environment: defaultEnvironmentVars,
  });

  const chargebeeGetCustomer = api.root.addResource(
    "chargebee-get-customer"
  );

  chargebeeGetCustomer.addMethod(
    "POST",
    new LambdaIntegration(chargebeeGetCustomerFunction)
  );

  chargebeeAccessToken.grantRead(chargebeeGetCustomerFunction);


  // Pause plan
  const chargebeePausePlanFunction = makeFunction(`chargebee-pause-plan`, {
    entry: entryName("handlers", "chargebee-pause-plan.ts"),
    environment: defaultEnvironmentVars,
  });

  const chargebeePausePlan = api.root.addResource(
    "chargebee-pause-plan"
  );

  chargebeePausePlan.addMethod(
    "POST",
    new LambdaIntegration(chargebeePausePlanFunction)
  );

  chargebeeAccessToken.grantRead(chargebeePausePlanFunction);



  // Un-Pause plan
  const chargebeeRemovePausePlanFunction = makeFunction(`chargebee-remove-pause`, {
    entry: entryName("handlers", "chargebee-remove-pause-plan.ts"),
    environment: defaultEnvironmentVars,
  });

  const chargebeeRemovePausePlan = api.root.addResource(
    "chargebee-remove-pause-plan"
  );

  chargebeeRemovePausePlan.addMethod(
    "POST",
    new LambdaIntegration(chargebeeRemovePausePlanFunction)
  );

  chargebeeAccessToken.grantRead(chargebeeRemovePausePlanFunction);



  // Issue pause credit (when subscription is resumed)
  const chargebeeIssuePauseCreditFunction = makeFunction(`chargebee-issue-pause-credit`, {
    entry: entryName("handlers", "chargebee-issue-pause-credit.ts"),
    environment: defaultEnvironmentVars,
  });

  const chargebeeIssuePauseCredit = api.root.addResource(
    "chargebee-issue-pause-credit"
  );

  chargebeeIssuePauseCredit.addMethod(
    "POST",
    new LambdaIntegration(chargebeeIssuePauseCreditFunction)
  );

  chargebeeAccessToken.grantRead(chargebeeIssuePauseCreditFunction);



  // Get latest invoice for customer
  const chargebeeGetLatestCustomerInvoiceFunction = makeFunction(`chargebee-get-latest-customer-invoice`, {
    entry: entryName("handlers", "chargebee-get-latest-customer-invoice.ts"),
    environment: defaultEnvironmentVars,
  });

  const chargebeeGetLatestCustomerInvoice = api.root.addResource(
    "chargebee-get-latest-customer-invoice"
  );

  chargebeeGetLatestCustomerInvoice.addMethod(
    "POST",
    new LambdaIntegration(chargebeeGetLatestCustomerInvoiceFunction)
  );

  chargebeeAccessToken.grantRead(chargebeeGetLatestCustomerInvoiceFunction);





  const apiCert = new DnsValidatedCertificate(context, "apiCertificate", {
    domainName,
    hostedZone,
  });

  const apiDomainName = api.addDomainName("data-api-domain-name", {
    domainName,
    certificate: apiCert,
  });

  new ARecord(context, "ApiARecord", {
    zone: hostedZone,
    recordName: domainName,
    target: RecordTarget.fromAlias(new ApiGatewayDomain(apiDomainName)),
  });

  return { api, recipesTable, customisationsTable };
};
