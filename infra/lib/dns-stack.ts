import { CfnOutput, Duration, Fn, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import {
  AaaaRecord,
  ARecord,
  CnameRecord,
  PublicHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';

export const GITHUB_PAGES_IPV4 = [
  '185.199.108.153',
  '185.199.109.153',
  '185.199.110.153',
  '185.199.111.153',
];

export const GITHUB_PAGES_IPV6 = [
  '2606:50c0:8000::153',
  '2606:50c0:8001::153',
  '2606:50c0:8002::153',
  '2606:50c0:8003::153',
];

// Short on purpose: the CloudFront cutover and its rollback are both a record swap,
// and a long TTL would stretch either one out by the same amount.
const RECORD_TTL = Duration.minutes(5);

export interface DnsStackProps extends StackProps {
  readonly domainName: string;
}

export class DnsStack extends Stack {
  readonly hostedZone: PublicHostedZone;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    this.hostedZone = new PublicHostedZone(this, 'Zone', { zoneName: props.domainName });
    this.hostedZone.applyRemovalPolicy(RemovalPolicy.RETAIN);

    const zone = this.hostedZone;

    new ARecord(this, 'ApexIpv4', {
      zone,
      target: RecordTarget.fromIpAddresses(...GITHUB_PAGES_IPV4),
      ttl: RECORD_TTL,
    });

    new AaaaRecord(this, 'ApexIpv6', {
      zone,
      target: RecordTarget.fromIpAddresses(...GITHUB_PAGES_IPV6),
      ttl: RECORD_TTL,
    });

    new CnameRecord(this, 'Www', {
      zone,
      recordName: 'www',
      domainName: 'koubatz.github.io',
      ttl: RECORD_TTL,
    });

    new CfnOutput(this, 'NameServers', {
      description: 'Nameservers to set for the domain at Registro.br',
      value: Fn.join(', ', this.hostedZone.hostedZoneNameServers!),
    });
  }
}
