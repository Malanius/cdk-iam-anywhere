import { type Duration, Stack } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as raw from 'aws-cdk-lib/aws-rolesanywhere';
import { Construct } from 'constructs';
import { DEFAULT_MAX_SESSION_DURATION } from './defaults';

export interface CdkAnywhereProfileProps {
  appName: string;
  maxSessionDuration?: Duration;
  acceptRoleSessionName?: boolean;
}

export class CdkAnywhereProfile extends Construct {
  constructor(scope: Construct, id: string, props: CdkAnywhereProfileProps) {
    super(scope, id);

    const { appName, maxSessionDuration, acceptRoleSessionName } = props;
    const account = Stack.of(this).account;

    const cdkRole = new iam.Role(this, 'CdkProfileRole', {
      roleName: `${appName}-roles-anywhere-cdk`,
      description: 'Role for AWS CDK deployments',
      assumedBy: new iam.ServicePrincipal('rolesanywhere.amazonaws.com'),
      maxSessionDuration,
    });

    const assumeCdkPolicy = new iam.Policy(this, 'AssumeCdkPolicy', {
      policyName: `${appName}-cdk-policy`,
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'sts:AssumeRole',
            'sts:TagSession',
            // 'sts:SetSourceIdentity',
          ],
          resources: [`arn:aws:iam::${account}:role/cdk-*`],
        }),
      ],
    });
    cdkRole.attachInlinePolicy(assumeCdkPolicy);

    new raw.CfnProfile(this, 'CdkProfile', {
      name: `${appName}-cdk-anywhere`,
      enabled: true,
      acceptRoleSessionName,
      roleArns: [cdkRole.roleArn],
      durationSeconds: (maxSessionDuration || DEFAULT_MAX_SESSION_DURATION).toSeconds(),
    });
  }
}
