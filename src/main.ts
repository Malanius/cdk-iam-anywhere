#!/usr/bin/env node
import { env } from 'node:process';
import { App } from 'aws-cdk-lib';
import 'source-map-support/register';

const APP_NAME = env.APP_NAME;

if (!APP_NAME) {
  throw new Error('APP_NAME environment variable is not set!');
}

const app = new App();

app.synth();
