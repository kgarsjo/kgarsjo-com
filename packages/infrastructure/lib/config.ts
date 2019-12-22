import { readFileSync } from 'fs';
import * as glob from 'glob';

export enum ConfigParams {
    UNZIPPER_LAMBDA_KEY = "KgarsjoComUnzipperLambdaBucketKey",
    WEBSITE_KEY = "KgarsjoComWebsiteBucketKey",
}

const getManifestParameters = (): {[key: string]: any} => {
    const manifests = glob.sync('../*/package/manifest.json');
    return manifests.map(manifest => readFileSync(manifest))
        .map(buffer => buffer.toString())
        .map(jsonString => JSON.parse(jsonString))
        .reduce(
            (prior, curr) => ({ ...prior, ...curr }),
            {},
        );
};

const config = {
    budgetSubscriberEmail: 'krgarsjo@gmail.com',
    parameters: getManifestParameters(),
};

console.log('Constructing with parameters:', config.parameters, '\n');

export const getRequiredParameter = (key: string): string => {
    if (!config.parameters[key]) {
        throw new Error(`Missing required parameter: ${key}`);
    }
    return config.parameters[key];;
}

export default config;