import { Stack, App, CfnOutput } from "@aws-cdk/core";
import { Certificate, ValidationMethod } from "@aws-cdk/aws-certificatemanager";
import AccountIDConfiguration, { AccountIDConfigMap } from "../Constructs/AccountIDConfiguration";

interface SSLCertStackProps {
    accountIDConfiguration: AccountIDConfigMap,
}

/**
 * This stack must be deployed in the us-east-1 region to be usable by CloudFront
 */
export default class SSLCertStack extends Stack {
    constructor(scope: App,name: string, props: SSLCertStackProps) {
        super(scope, name);
        const accountIDConfig = new AccountIDConfiguration(this, props.accountIDConfiguration);
        const domainName = accountIDConfig.getDomainName();

        const sslCertificate = new Certificate(this, 'SSLCertificate', {
            domainName,
            validationDomains: {
                [domainName]: 'kgarsjo.com',
            },
            validationMethod: ValidationMethod.DNS,
        });

        new CfnOutput(this, 'SSLCertificateARN', {
            value: sslCertificate.certificateArn,
            exportName: 'SSLCertificateARN',
        });
    }
}