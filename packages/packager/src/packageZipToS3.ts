import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { CloudFormation, S3 } from 'aws-sdk';
import * as AdmZip from 'adm-zip';
import { Stack, Output } from 'aws-sdk/clients/cloudformation';
import { describeAsyncOperation, describeOperation } from './describeOperation';

const PACKAGE_DIR = './package';

const getCloudFormation = () => new CloudFormation();
const getS3 =() => new S3();

const getManifestPath = () => `${PACKAGE_DIR}/manifest.json`;

const getBuildOutputBucketName =  describeAsyncOperation({
    getStartMessage: () => 'Fetching S3 Build Output Bucket Name',
    operationFn: async () => {
        const cfn = getCloudFormation();
        const stackResponse = await cfn.describeStacks({
            StackName: 'KgarsjoComCIStack',
        }).promise();
        const stacks = stackResponse.Stacks as Stack[];
        const outputs = stacks[0].Outputs as Output[];
        const bucketNameOutput = outputs.find(o => o.OutputKey === 'BuildOutputBucketName') as Output;
        const bucketName = bucketNameOutput.OutputValue;
        console.info(`Using "${bucketName}"`);
        return bucketName;
    },
    successMessage: 'Successfully retrieved Build Output Bucket Name!',
    errorMessage: 'Bucket name retrieval failed',
});

interface BundleProps {
    dirsToBundle: string[],
    filesToBundle: string[],
    rootsToBundle: string[],
}
const bundle = describeOperation({
    getStartMessage: ({ dirsToBundle, filesToBundle, rootsToBundle }: BundleProps) => `Bundling ${dirsToBundle}; ${filesToBundle}; ${rootsToBundle}`,
    operationFn: ({ dirsToBundle, filesToBundle, rootsToBundle }: BundleProps) => {
        const zip = new AdmZip();
        dirsToBundle.forEach(dir => zip.addLocalFolder(dir, dir));
        filesToBundle.forEach(file => zip.addLocalFile(file));
        rootsToBundle.forEach(root => zip.addLocalFolder(root));
        return zip.toBuffer();
    },
    successMessage: 'Bundled Successfully!',
    errorMessage: 'Bundling Failed',
});

const uploadBundle = describeAsyncOperation({
    getStartMessage: (_, bucket: string, key: string) => `Uploading bundle to ${bucket}:${key}`,
    operationFn: async (zipBuffer: Buffer, bucket: string, key: string) => (
        await getS3().putObject({
            Body: zipBuffer,
            Bucket: bucket,
            Key: key,
        }).promise()
    ),
    successMessage: 'Successfully Uploaded!',
    errorMessage: 'Upload failed',
}); 

const writeManifest = describeOperation({
    getStartMessage: (packageName: string) => `Writing packaging manifest for ${packageName}`,
    operationFn: (packageName: string, s3Key: string) => {
        execSync('mkdir -p package/');
        writeFileSync(getManifestPath(), JSON.stringify(
            { [`${packageName}BucketKey`]: s3Key },
            null,
            2,
        ))
    },
    successMessage: 'Successfully written package manifest!',
    errorMessage: 'Writing package manifest failed',
});

export interface PackageZipToS3Props {
    packageName: string,
    dirsToBundle?: Array<string>,
    filesToBundle?: Array<string>,
    rootsToBundle?: Array<string>,
}
const packageZipToS3 = async ({
    packageName,
    dirsToBundle = [],
    filesToBundle = [],
    rootsToBundle = [],
}: PackageZipToS3Props) => {
    const bucket = await getBuildOutputBucketName();
    const artifactStamp = Date.now();
    const artifactFilename = `${artifactStamp}.zip`;
    const zipBuffer = await bundle({ dirsToBundle, filesToBundle, rootsToBundle });

    const s3Key = `${packageName}/${artifactFilename}`
    await uploadBundle(zipBuffer, bucket, s3Key);
    await writeManifest(packageName, s3Key);
}

export default packageZipToS3;