#!/usr/bin/env node
import { env } from 'node:process';
import { App } from 'aws-cdk-lib';
import 'source-map-support/register';
import { RolesAnywhere } from './roles-anywhere/roles-anywhere.stack';

const APP_NAME = env.APP_NAME;

if (!APP_NAME) {
  throw new Error('APP_NAME environment variable is not set!');
}

const app = new App();

new RolesAnywhere(app, `${APP_NAME}-roles-anywhere`, {
  appName: APP_NAME,
  stackName: `${APP_NAME}-roles-anywhere`,
  description: 'IAM Roles Anywhere setup',
  terminationProtection: true,
  tags: {
    project: APP_NAME,
    env: 'aws',
  },
});

app.synth();
