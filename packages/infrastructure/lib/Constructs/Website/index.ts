import { Construct, CfnOutput, CfnResource, Duration } from "@aws-cdk/core";
import { OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import { Function, S3Code, Runtime } from "@aws-cdk/aws-lambda";
import { IBucket, Bucket } from "@aws-cdk/aws-s3";
import { PolicyStatement, CanonicalUserPrincipal } from "@aws-cdk/aws-iam";

interface WebsiteProps {
    unzipperLambdaBucket: IBucket,
    unzipperLambdaKey: string,
    unzipperLambdaHandler: string,
    websiteBucket: IBucket,
    websiteKey: string,
}

export default class Website extends Construct {
    constructor(scope: Construct, props: WebsiteProps) {
        const { unzipperLambdaHandler, unzipperLambdaBucket, unzipperLambdaKey, websiteBucket, websiteKey } = props;
        super(scope, `Website`);

        const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
        
        const oaiS3UserId = originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId;

        const hostingBucket = new Bucket(this, 'HostingBucket');
        hostingBucket.addToResourcePolicy(new PolicyStatement({
            actions: ['s3:GetObject'],
            principals: [new CanonicalUserPrincipal(oaiS3UserId)],
            resources: [hostingBucket.arnForObjects('*')],
        }));
        hostingBucket.addToResourcePolicy(new PolicyStatement({
            actions: ['s3:ListBucket'],
            principals: [new CanonicalUserPrincipal(oaiS3UserId)],
            resources: [hostingBucket.bucketArn],
        }));

        new CfnOutput(this, 'HostingBucketName', {
            value: hostingBucket.bucketName,
        });

        const unzipperLambda = new Function(this, `WebsiteUnzipper`, {
            code: new S3Code(unzipperLambdaBucket, unzipperLambdaKey),
            runtime: Runtime.NODEJS_12_X,
            handler: unzipperLambdaHandler,
            environment: {
                SOURCE_BUCKET_NAME: websiteBucket.bucketName,
            },
            timeout: Duration.seconds(60),
        });
        unzipperLambda.addToRolePolicy(new PolicyStatement({
            actions: [
                's3:DeleteObject',
                's3:GetObject',
                's3:PutObject',
            ],
            resources: [
                hostingBucket.bucketArn,
                hostingBucket.arnForObjects('*'),
            ]
        }));
        
        const unzipperCustomResource = new CfnResource(this, 'UnzipperCustomResource', {
            type: 'Custom::Unzipper',
            properties: {
                ServiceToken: unzipperLambda.functionArn,
                DestinationBucket: hostingBucket.bucketName,
                Key: websiteKey,
            }
        });
        unzipperCustomResource.node.addDependency(unzipperLambda);

        /*
        const appRoot = 'index.html';
        const distribution = new CloudFrontWebDistribution(this, 'Distribution', {
            defaultRootObject: appRoot,
            enableIpV6: true,
            errorConfigurations: [{
                errorCode: 404,
                responseCode: 200,
                responsePagePath: `/${appRoot}`,
            }],
            httpVersion: HttpVersion.HTTP2,
            priceClass: PriceClass.PRICE_CLASS_100,
            originConfigs: [{
                behaviors: [{
                    isDefaultBehavior: true,
                    allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                    compress: true,
                }],
                s3OriginSource: {
                    originAccessIdentity,
                    s3BucketSource: hostingBucket,
                },
            }],
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        });
        new CfnOutput(this, 'DistributionDomainName', {
            value: distribution.domainName
        });
        */
    }
}