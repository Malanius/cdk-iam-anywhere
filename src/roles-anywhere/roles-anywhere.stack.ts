import { readFileSync } from 'node:fs';
import type { StackProps } from 'aws-cdk-lib';
import { type Duration, Stack } from 'aws-cdk-lib';
import * as raw from 'aws-cdk-lib/aws-rolesanywhere';
import type { Construct } from 'constructs';
import { CdkAnywhereProfile } from './cdk-profile';
import { DEFAULT_NOTIFICATIONS_TRESHOLD_DAYS } from './defaults';

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

    const { appName, notificationsTresholdDays } = props;

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

    new CdkAnywhereProfile(this, 'CdkProfile', {
      ...props,
    });
  }
}
