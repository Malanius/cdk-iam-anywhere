import { readFileSync } from 'node:fs';
import type { StackProps } from 'aws-cdk-lib';
import { Duration, Stack } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as raw from 'aws-cdk-lib/aws-rolesanywhere';
import type { Construct } from 'constructs';

const DEFAULT_NOTIFICATIONS_TRESHOLD_DAYS = 45;
const DEFAULT_MAX_SESSION_DURATION = Duration.hours(12).toSeconds();

export interface RolesAnywhereProps extends StackProps {
  /**
   * Application name, used for naming prefix of resources.
   */
  appName: string;
  /**
   * Number of days before certificate expiration to send notifications.
   *
   * @default 45 days
   */
  notificationsTresholdDays?: number;
  /**
   * Whether to accept role session names in the profile.
   *
   * @default false
   */
  acceptRoleSessionName?: boolean;
  /**
   * Maximum session duration for the profile (between 900 seconds and 43200 seconds (12 hours)).
   *
   * @example Duration.hours(1)
   *
   * @default 43200 (12 hours)
   */
  maxSessionDuration?: Duration;
}

export class RolesAnywhere extends Stack {
  constructor(scope: Construct, id: string, props: RolesAnywhereProps) {
    super(scope, id, props);

    const { appName, notificationsTresholdDays, maxSessionDuration, acceptRoleSessionName } = props;

    const x509CertificateData = readFileSync('certs/ca.crt', 'utf8');

    new raw.CfnTrustAnchor(this, 'TrustAnchor', {
      name: `${appName}-trust-anchor`,
      enabled: true,
      source: {
        sourceType: 'CERTIFICATE_BUNDLE',
        sourceData: {
          x509CertificateData,
        },
      },
      notificationSettings: [
        {
          enabled: true,
          channel: 'ALL',
          event: 'CA_CERTIFICATE_EXPIRY',
          threshold: notificationsTresholdDays ?? DEFAULT_NOTIFICATIONS_TRESHOLD_DAYS,
        },
        {
          enabled: true,
          channel: 'ALL',
          event: 'END_ENTITY_CERTIFICATE_EXPIRY',
          threshold: notificationsTresholdDays ?? DEFAULT_NOTIFICATIONS_TRESHOLD_DAYS,
        },
      ],
    });

    const profileRole = new iam.Role(this, 'Role', {
      roleName: `${appName}-iam-anywhere-role`,
      description: 'Role for IAM Roles Anywhere',
      assumedBy: new iam.ServicePrincipal('rolesanywhere.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess')],
    });
    profileRole.assumeRolePolicy?.addStatements(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('rolesanywhere.amazonaws.com')],
        actions: ['sts:AssumeRole', 'sts:SetSourceIdentity', 'sts:TagSession'],
      })
    );

    new raw.CfnProfile(this, 'Profile', {
      name: `${appName}-iam-anywhere`,
      enabled: true,
      acceptRoleSessionName,
      roleArns: [profileRole.roleArn],
      durationSeconds: maxSessionDuration?.toSeconds() ?? DEFAULT_MAX_SESSION_DURATION,
    });
  }
}
