import { Stack, Construct, CfnOutput } from "@aws-cdk/cdk";
import { User } from "@aws-cdk/aws-iam";
import { Bucket } from "@aws-cdk/aws-s3";
import { BuildOutput } from "../Constants/BuildOutput";

export default class CIStack extends Stack {
    constructor(parent: Construct, id: string) {
        super(parent, id);

        const ciUser = new User(this, 'KgarsjoComCIUser');
        ciUser.attachManagedPolicy('arn:aws:iam::aws:policy/AdministratorAccess');

        const buildOutputBucket = new Bucket(this, 'BuildOutputBucket', {
            lifecycleRules: [{
                expirationInDays: 3,
            }],
        });

        new CfnOutput(this, BuildOutput.BUCKET_NAME_EXPORT, {
            value: buildOutputBucket.bucketName,
            export: BuildOutput.BUCKET_NAME_EXPORT,
        })
    }
}