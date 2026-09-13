import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, expect, it } from 'vitest';
import { DnsStack } from '../lib/dns-stack';

function synthesize(): Template {
  const app = new App();
  const stack = new DnsStack(app, 'TestDns', { domainName: 'koubatz.com.br' });
  return Template.fromStack(stack);
}

describe('DnsStack', () => {
  const template = synthesize();

  it('creates the public zone and keeps it if the stack is ever deleted', () => {
    template.hasResource('AWS::Route53::HostedZone', {
      Properties: { Name: 'koubatz.com.br.' },
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain',
    });
  });

  // These mirror the records live on the Registro.br DNS today, so moving the
  // nameservers changes who answers for the domain without changing the answer.
  it('points the apex at GitHub Pages over IPv4', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'koubatz.com.br.',
      Type: 'A',
      TTL: '300',
      ResourceRecords: ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153'],
    });
  });

  it('points the apex at GitHub Pages over IPv6', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'koubatz.com.br.',
      Type: 'AAAA',
      TTL: '300',
      ResourceRecords: [
        '2606:50c0:8000::153',
        '2606:50c0:8001::153',
        '2606:50c0:8002::153',
        '2606:50c0:8003::153',
      ],
    });
  });

  it('keeps www aliased to the GitHub Pages host', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'www.koubatz.com.br.',
      Type: 'CNAME',
      TTL: '300',
      ResourceRecords: ['koubatz.github.io'],
    });
  });

  it('creates nothing beyond the three records that exist today', () => {
    expect(Object.keys(template.findResources('AWS::Route53::RecordSet'))).toHaveLength(3);
  });

  it('exposes the nameservers to configure at the registrar', () => {
    template.hasOutput('NameServers', {});
  });
});
