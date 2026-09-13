import { App } from 'aws-cdk-lib';
import { DnsStack } from '../lib/dns-stack';

const app = new App();

new DnsStack(app, 'KoubatzDns', {
  env: { account: process.env['CDK_DEFAULT_ACCOUNT'], region: 'sa-east-1' },
  // Deleting this stack would take the whole domain offline.
  terminationProtection: true,
  domainName: 'koubatz.com.br',
});
