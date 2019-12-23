import { Stack, Construct, CfnOutput, Aws, Duration } from "@aws-cdk/core";
import { User, ManagedPolicy } from "@aws-cdk/aws-iam";
import { Bucket } from "@aws-cdk/aws-s3";
import { BuildOutput } from "../../Constants/BuildOutput";

interface BootstrapStackProps {
    projectName: string,
}

export default class BootstrapStack extends Stack {
    constructor(parent: Construct, id: string, props: BootstrapStackProps) {
        super(parent, id);

        const { projectName } = props;

        new User(this, 'AdminConsoleUser', {
            managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
            userName: `admin`,
        });

        new User(this, 'CIUser', {managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
            userName: `${projectName}CIUser`,
        });

        new User(this, 'CLIUser', {managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
            userName: `${projectName}CLIUser`,
        });

        const buildOutputBucket = new Bucket(this, 'BuildOutputBucket', {
            bucketName: `${projectName.toLowerCase()}-build-output-bucket-${Aws.ACCOUNT_ID}`,
            lifecycleRules: [{ expiration: Duration.days(1) }],
        });

        new CfnOutput(this, BuildOutput.BUCKET_NAME_EXPORT, {
            value: buildOutputBucket.bucketName,
            exportName: BuildOutput.BUCKET_NAME_EXPORT,
        })
    }
}