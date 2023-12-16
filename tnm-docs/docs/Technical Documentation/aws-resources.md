---
id: aws-resources
title: AWS Resources
tags:
  - AWS
  - Cloud
  - Resources
description: Details of the different AWS resources that back the application
---

  
# AWS Resources

Resources for the TNM application are deployed into `eu-west-2`, with the exception of TLS certificates

## Route 53

DNS is delegated from Cloudflare to the following AWS [hosted zones](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zones-working-with.html)

|Environment|Zone|
|--|--|
|E2E|[cypress.thenutritionistmcr.com](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones?region=us-east-1#ListRecordSets/Z05322541CLUYJ3SL5AYG)|
|Test|[test.thenutritionistmcr.com](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones?region=us-east-1#ListRecordSets/Z09456024IESD86E841R)|
|Production|[portal.thenutritionistmcr.com](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones?region=us-east-1#ListRecordSets/Z08724511L3HBMIUVWWA7)|

## Cloudfront
The application sits in front of a Cloudfront Distribution which also handles TLS termination. 

|Environment|Distribution|
|--|--|
|E2E|[E1GB3ABKLCIL6J](https://us-east-1.console.aws.amazon.com/cloudfront/v4/home?region=eu-west-2#/distributions/E1GB3ABKLCIL6J)|
|Test|[E2A8UP8WCH23SC](https://us-east-1.console.aws.amazon.com/cloudfront/v4/home?region=eu-west-2#/distributions/E2A8UP8WCH23SC)|
|Production|[E32U2N7VTZWMTI](https://us-east-1.console.aws.amazon.com/cloudfront/v4/home?region=eu-west-2#/distributions/E32U2N7VTZWMTI)|

## Cognito
Application users are managed by AWS cognito. You'll need to go here if you want to delete or disable users, as well as adding staff members to the 'admin' group

|Environment|Distribution|
|--|--|
|E2E|[tnm-web-user-pool-cypress](https://eu-west-2.console.aws.amazon.com/cognito/v2/idp/user-pools/eu-west-2_77z37j3Fb/users?region=eu-west-2)|
|Test|[tnm-web-user-pool-test](https://eu-west-2.console.aws.amazon.com/cognito/v2/idp/user-pools/eu-west-2_Lugb2kvTi/users?region=eu-west-2)|
|Production|[tnm-web-user-pool-prod](https://eu-west-2.console.aws.amazon.com/cognito/v2/idp/user-pools/eu-west-2_ra8ncdI4o/users?region=eu-west-2)|

## DynamoDB
Application data is stored here. By default you'll have read only access to the data tables, but you can make changes by assuming the 'production data access' IAM role. **Note, that you should only really ever directly edit DynamoDB for specific use cases that can't be handled by the Portal application**.

### Customisations

Stores the list of 'customisation' tags that are available.

| Environment | Table |
|--|--|
| E2E | [tnm-web-customisation-table-cypress](https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?table=tnm-web-customisation-table-cypress)|
| Test | [tnm-web-customisation-table-test](https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?operation=QUERY&table=tnm-web-customisation-table-test)|
| Prod | [tnm-web-plan-table-table-prod](https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?operation=QUERY&table=tnm-web-plan-table-table-prod)|


### Recipes

Stores the list of 'recipes' that are managed by the business.

| Environment | Table |
|--|--|
| E2E | [tnm-web-recipe-table-cypress](https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?operation=QUERY&table=tnm-web-recipe-table-cypress)|
| Test | [tnm-web-recipe-table-test](https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?operation=QUERY&table=tnm-web-recipe-table-test)|
| Prod | [tnm-web-recipe-table-prod](https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?operation=QUERY&table=tnm-web-recipe-table-prod)|

### Plans

Stores the 'meal plan' object for the weekly cooks

| Environment | Table |
|--|--|
| E2E | [tnm-web-plan-table-table-cypress](https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?operation=QUERY&table=tnm-web-plan-table-table-cypress)|
| Test | [tnm-web-plan-table-table-test](https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?operation=QUERY&table=tnm-web-plan-table-table-test)|
| Prod | [tnm-web-plan-table-table-prod](https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?operation=QUERY&table=tnm-web-plan-table-table-prod)|