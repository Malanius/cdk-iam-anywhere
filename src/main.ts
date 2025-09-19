#!/usr/bin/env node
import { env } from 'node:process';
import { App } from 'aws-cdk-lib';
import 'source-map-support/register';
import { AppStage } from './stage';

const appName = 'TODO'; // TODO: replace with your project name
const appEnv = env.APP_ENV || 'dev';
const app = new App();

new AppStage(app, appEnv, { appName });

app.synth();
