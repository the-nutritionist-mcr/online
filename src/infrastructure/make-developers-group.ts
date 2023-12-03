import { Group, ManagedPolicy, Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export const makeDevelopersGroup = (scope: Construct) => {
  const readOnlyAccess =
    ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess");

  const developersGroup = new Group(scope, "tnm-web-developers-group", {
    groupName: "tnm-web-developer",
    managedPolicies: [readOnlyAccess],
  });

  const prodDataAccessRole = new Role(scope, "prod-data-access", {
    assumedBy: developersGroup,
  });

  return { developersGroup, prodDataAccessRole };
};
