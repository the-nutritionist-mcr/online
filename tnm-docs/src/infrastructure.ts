import { App, Stack } from "aws-cdk-lib";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  ARecord,
  PublicHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import path from "path";

export class DocsStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const assetsBucket = new Bucket(this, "AssetsBucket", {
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    });

    new BucketDeployment(this, "AssetsDeployment", {
      destinationBucket: assetsBucket,
      sources: [Source.asset(path.join(__dirname, "..", "build"))],
    });

    const domainName = "docs.thenutritionistmcr.com";

    const hostedZone = new PublicHostedZone(this, "HostedZone", {
      zoneName: domainName,
    });

    const certificate = new DnsValidatedCertificate(this, "cert", {
      domainName,
      hostedZone,
      region: "us-east-1",
    });

    const distribution = new Distribution(this, "tnm-web-distribution", {
      defaultBehavior: {
        origin: new S3Origin(assetsBucket),
      },
      certificate,
      domainNames: [domainName],
    });

    new ARecord(this, "FrontendARecord", {
      zone: hostedZone,
      recordName: domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}

const app = new App();

new DocsStack(app, "tnm-documentation-stack");

app.synth();