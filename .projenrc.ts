import { awscdk } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript/node-package';
import { ReleaseTrigger } from 'projen/lib/release';
import { biomeOptions } from './.projenrc.biome';

const cdkVersion = '2.215.0';
const powertoolsVersion = '2.26.1';
const awsSdkVersion = '3.891.0';

const project = new awscdk.AwsCdkTypeScriptApp({
  name: 'TODO', // TODO: replace with your project name
  authorName: 'TODO', // TODO: replace with your name
  authorEmail: 'TODO', // TODO: replace with your email

  cdkVersion,
  cdkVersionPinning: true,

  release: false,
  releaseTrigger: ReleaseTrigger.manual(),
  defaultReleaseBranch: 'main',
  github: false,

  packageManager: NodePackageManager.PNPM,

  scripts: {
    prepare: 'npx lefthook install',
    check: 'npx @biomejs/biome check --write',
    'check:staged': 'npx @biomejs/biome check --write --staged',
  },

  projenrcTs: true,
  tsconfig: {
    compilerOptions: {
      baseUrl: '.',
      paths: {
        '@/*': ['src/*'],
      },
    },
  },

  biome: true,
  biomeOptions,

  lambdaOptions: {
    runtime: awscdk.LambdaRuntime.NODEJS_22_X,
    awsSdkConnectionReuse: true,
    bundlingOptions: {
      externals: [],
      sourcemap: true,
    },
  },

  deps: [
    `@aws-lambda-powertools/batch@${powertoolsVersion}`,
    `@aws-lambda-powertools/logger@${powertoolsVersion}`,
    `@aws-lambda-powertools/parameters@${powertoolsVersion}`,
    `@aws-lambda-powertools/parser@${powertoolsVersion}`,
    `@aws-lambda-powertools/tracer@${powertoolsVersion}`,
    `@aws-lambda-powertools/validation@${powertoolsVersion}`,
    // TODO: add any other dependencies your project requires
    `@aws-sdk/client-secrets-manager@${awsSdkVersion}`,
    '@middy/core',
    'zod@~4',
  ],
  devDeps: [
    '@commitlint/config-conventional',
    '@types/aws-lambda',
    'commitlint',
    'cz-conventional-changelog',
    'lefthook',
    'ts-node',
    'tsconfig-paths',
  ],
});

// There is no way to directly register modules in in projen
// So having to use escape hatch to add tsconfig-paths/register
const cdkJson = project.tryFindObjectFile('cdk.json');
cdkJson?.addOverride('app', 'npx ts-node -r tsconfig-paths/register --prefer-ts-exts src/main.ts');

// Not sure why projen is not setting this
project.addFields({
  packageManager: 'pnpm@10.15.0',
});

project.synth();
