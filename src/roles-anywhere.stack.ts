import { readFileSync } from 'node:fs';
import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import * as raw from 'aws-cdk-lib/aws-rolesanywhere';
import type { Construct } from 'constructs';

const DEFAULT_NOTIFICATIONS_TRESHOLD_DAYS = 45;

export interface RolesAnywhereProps extends StackProps {
  appName: string;
  notificationsTresholdDays?: number;
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
  }
}
