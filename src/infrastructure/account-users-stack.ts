import { Stack, StackProps } from "aws-cdk-lib";
import {
  Group,
  IGroup,
  IRole,
  ManagedPolicy,
  Role,
  User,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { makeDevelopersGroup } from "./make-developers-group";

interface AccountUsersStackProps {
  businessOwners: string[];
  developers: string[];
  stackProps: StackProps;
}

const billing = ManagedPolicy.fromAwsManagedPolicyName("job-function/Billing");

export class AccountUsersStack extends Stack {
  public businessOwnersGroup: IGroup;
  public developersGroup: IGroup;
  public prodDataAccessRole: IRole;

  constructor(scope: Construct, id: string, props: AccountUsersStackProps) {
    super(scope, id, props.stackProps);

    const readOnlyAccess =
      ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess");

    const cognitoPowerUser = ManagedPolicy.fromAwsManagedPolicyName(
      "AmazonCognitoPowerUser"
    );

    this.businessOwnersGroup = new Group(this, "tnm-web-business-owner-group", {
      groupName: "tnm-web-business-owner",
    });

    props.businessOwners.forEach(
      (owner) =>
        new User(this, `${owner}-user`, {
          groups: [this.businessOwnersGroup],
          managedPolicies: [readOnlyAccess, billing, cognitoPowerUser],
          userName: owner,
        })
    );

    const { developersGroup, prodDataAccessRole } = makeDevelopersGroup(this);

    this.developersGroup = developersGroup;
    this.prodDataAccessRole = prodDataAccessRole;

    props.developers.forEach(
      (developer) =>
        new User(this, `${developer}-user`, {
          groups: [this.developersGroup],
          managedPolicies: [readOnlyAccess],
          userName: developer,
        })
    );
  }
}
