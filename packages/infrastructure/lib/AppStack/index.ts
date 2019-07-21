import { App, Stack, Fn } from '@aws-cdk/cdk';
import { Bucket } from '@aws-cdk/aws-s3';
import { BuildOutput } from '../Constants/BuildOutput';
import Website from './Website';

export interface AppStackConfig {
    budgetSubscriberEmail: string,
}

export default class AppStack extends Stack {
    constructor(scope: App, name: string) {
        super(scope, name);

        const buildOutputBucket = Bucket.import(this, 'BuildOutputBucket', {
            bucketName: Fn.importValue(BuildOutput.BUCKET_NAME_EXPORT),
        });

        new Website(this, buildOutputBucket);
    }
}