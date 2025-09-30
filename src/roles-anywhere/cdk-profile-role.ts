import { type Duration, Stack } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface CdkProfileRoleProps {
  appName: string;
  maxSessionDuration: Duration;
}

export class CdkProfileRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: CdkProfileRoleProps) {
    super(scope, id);

    const { appName, maxSessionDuration } = props;
    const account = Stack.of(this).account;

    this.role = new iam.Role(this, 'CdkProfileRole', {
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
    this.role.attachInlinePolicy(assumeCdkPolicy);
  }
}
