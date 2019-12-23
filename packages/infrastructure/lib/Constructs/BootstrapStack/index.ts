import { Stack, Construct, CfnOutput, Aws } from "@aws-cdk/cdk";
import { User } from "@aws-cdk/aws-iam";
import { Bucket } from "@aws-cdk/aws-s3";
import { BuildOutput } from "../../Constants/BuildOutput";

interface BootstrapStackProps {
    projectName: string,
}

export default class BootstrapStack extends Stack {
    constructor(parent: Construct, id: string, props: BootstrapStackProps) {
        super(parent, id);

        const { projectName } = props;

        const adminConsoleUser = new User(this, 'AdminConsoleUser', { userName: `${projectName.toLowerCase()}-admin` });
        adminConsoleUser.attachManagedPolicy('arn:aws:iam::aws:policy/AdministratorAccess');

        const ciUser = new User(this, 'CIUser', { userName: `${projectName}CIUser` });
        ciUser.attachManagedPolicy('arn:aws:iam::aws:policy/AdministratorAccess');

        const cliUser = new User(this, 'CLIUser', { userName: `${projectName}CLIUser` });
        cliUser.attachManagedPolicy('arn:aws:iam::aws:policy/AdministratorAccess');

        const buildOutputBucket = new Bucket(this, 'BuildOutputBucket', {
            bucketName: `${projectName.toLowerCase()}-build-output-bucket-${Aws.accountId}`,
            lifecycleRules: [{ expirationInDays: 3 }],
        });

        new CfnOutput(this, BuildOutput.BUCKET_NAME_EXPORT, {
            value: buildOutputBucket.bucketName,
            export: BuildOutput.BUCKET_NAME_EXPORT,
        })
    }
}