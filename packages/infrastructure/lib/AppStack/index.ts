import { App, Stack, CfnParameter } from '@aws-cdk/cdk';
import Website from './Website';
import { Bucket } from '@aws-cdk/aws-s3';

export interface AppStackConfig {
    budgetSubscriberEmail: string,
}

export default class AppStack extends Stack {
    constructor(scope: App, name: string) {
        super(scope, name);

        new Website(this, {
            unzipperLambdaBucket: Bucket.import(this, 'UnzipperLambdaBucket', {
                bucketName: new CfnParameter(this, 'UnzipperLambdaArtifactBucket', {
                    type: 'String',
                }).resolve(),
            }),
            unzipperLambdaKey: new CfnParameter(this, 'UnzipperLambdaArtifactKey', {
                type: 'String',
            }).resolve(),
            unzipperLambdaHandler: new CfnParameter(this, 'UnzipperLambdaHandler', {
                type: 'String',
            }).resolve(),
            websiteBucket: Bucket.import(this, 'WebsiteBucket', {
                bucketName: new CfnParameter(this, 'WebsiteArtifactBucket', {
                    type: 'String'
                }).resolve(),
            }),
            websiteKey: new CfnParameter(this, 'WebsiteArtifactKey', {
                type: 'String',
            }).resolve(),
        });
    }
}