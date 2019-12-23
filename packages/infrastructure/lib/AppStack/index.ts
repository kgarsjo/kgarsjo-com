import { App, Stack, CfnParameter } from '@aws-cdk/core';
import Website from '../Constructs/Website';
import { Bucket } from '@aws-cdk/aws-s3';

export interface AppStackConfig {
    budgetSubscriberEmail: string,
}

export default class AppStack extends Stack {
    constructor(scope: App, name: string) {
        super(scope, name);

        new Website(this, {
            unzipperLambdaBucket: Bucket.fromBucketName(this, 'UnzipperLambdaBucket',
                new CfnParameter(this, 'UnzipperLambdaArtifactBucket', {
                    type: 'String',
                }).valueAsString),
            unzipperLambdaKey: new CfnParameter(this, 'UnzipperLambdaArtifactKey', {
                type: 'String',
            }).valueAsString,
            unzipperLambdaHandler: new CfnParameter(this, 'UnzipperLambdaHandler', {
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