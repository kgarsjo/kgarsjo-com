import { App, Stack, CfnParameter } from '@aws-cdk/core';
import Website from '../Constructs/Website';
import { Bucket } from '@aws-cdk/aws-s3';
import AccountIDConfiguration, { AccountIDConfigMap } from '../Constructs/AccountIDConfiguration';

export interface AppStackConfig {
    accountIDConfiguration: AccountIDConfigMap,
}

export default class AppStack extends Stack {
    constructor(scope: App, name: string, props: AppStackConfig) {
        super(scope, name);
        
        const accountIDConfig = new AccountIDConfiguration(this, props.accountIDConfiguration);

        new Website(this, {
            domainName: accountIDConfig.getDomainName(),
            sslCertificateARN: accountIDConfig.getSSLCertificateArn(),
            unzipperLambdaBucket: Bucket.fromBucketName(this, 'UnzipperLambdaBucket',
                new CfnParameter(this, 'UnzipperLambdaArtifactBucket', {
                    type: 'String',
                }).valueAsString),
            unzipperLambdaKey: new CfnParameter(this, 'UnzipperLambdaArtifactKey', {
                type: 'String',
            }).valueAsString,
            websiteBucket: Bucket.fromBucketName(this, 'WebsiteBucket',
                new CfnParameter(this, 'WebsiteArtifactBucket', {
                    type: 'String'
                }).valueAsString),
            websiteKey: new CfnParameter(this, 'WebsiteArtifactKey', {
                type: 'String',
            }).valueAsString,
        });
    }
}