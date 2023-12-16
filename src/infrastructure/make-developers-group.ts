import {
  AnyPrincipal,
  Effect,
  Group,
  ManagedPolicy,
  PolicyStatement,
  Role,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export const makeDevelopersGroup = (scope: Construct) => {
  const readOnlyAccess =
    ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess");

  const developersGroup = new Group(scope, "tnm-web-developers-group", {
    groupName: "tnm-web-developer",
    managedPolicies: [readOnlyAccess],
  });

  const prodDataAccessRole = new Role(scope, "prod-data-access", {
    assumedBy: new AnyPrincipal(),
    managedPolicies: [readOnlyAccess],
  });

  const assumePolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["sts:AssumeRole"],
    resources: [prodDataAccessRole.roleArn],
  });

  developersGroup.addToPolicy(assumePolicy);

  return { developersGroup, prodDataAccessRole };
};
