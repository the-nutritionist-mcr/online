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

  const deployRole = Role.fromRoleArn(
    scope,
    "cdk-deploy-role",
    "arn:aws:iam::568693217207:role/cdk-hnb659fds-deploy-role-568693217207-eu-west-2"
  );

  const filePublishingRole = Role.fromRoleArn(
    scope,
    "cdk-file-publishing-role",
    "arn:aws:iam::568693217207:role/cdk-hnb659fds-file-publishing-role-568693217207-eu-west-2"
  );

  const prodDataAccessRole = new Role(scope, "prod-data-access", {
    assumedBy: new AnyPrincipal(),
    managedPolicies: [readOnlyAccess],
  });

  const assumePolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["sts:AssumeRole"],
    resources: [
      prodDataAccessRole.roleArn,
      filePublishingRole.roleArn,
      deployRole.roleArn,
    ],
  });

  developersGroup.addToPolicy(assumePolicy);

  return { developersGroup, prodDataAccessRole };
};
