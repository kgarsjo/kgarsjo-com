import { Construct, CfnOutput, CfnResource } from "@aws-cdk/cdk";
import { CfnCloudFrontOriginAccessIdentity, CloudFrontWebDistribution, CloudFrontAllowedMethods, HttpVersion, PriceClass, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { Function, S3Code, Runtime } from "@aws-cdk/aws-lambda";
import { IBucket, Bucket } from "@aws-cdk/aws-s3";
import { getRequiredParameter, ConfigParams } from "../../config";
import { PolicyStatement, CanonicalUserPrincipal } from "@aws-cdk/aws-iam";

export default class Website extends Construct {
    constructor(scope: Construct, buildOutputBucket: IBucket) {
        super(scope, 'KgarsjoComWebiste');

        const originAccessIdentity = new CfnCloudFrontOriginAccessIdentity(this,'OriginAccessIdentity', {
            cloudFrontOriginAccessIdentityConfig: {
                comment: '',
            }
        });
        
        const oaiS3UserId = this.node.resolve(originAccessIdentity.getAtt("S3CanonicalUserId"));

        const hostingBucket = new Bucket(this, 'HostingBucket');
        hostingBucket.addToResourcePolicy(new PolicyStatement()
            .addActions('s3:GetObject')
            .addPrincipal(new CanonicalUserPrincipal(oaiS3UserId))
            .addResource(hostingBucket.arnForObjects('*')));
        hostingBucket.addToResourcePolicy(new PolicyStatement()
            .addActions('s3:ListBucket')
            .addPrincipal(new CanonicalUserPrincipal(oaiS3UserId))
            .addResource(hostingBucket.bucketArn));
        new CfnOutput(this, 'HostingBucketName', {
            value: hostingBucket.bucketName,
        });

        const unzipperLambda = new Function(this, 'KgarsjoWebsiteUnzipper', {
            code: new S3Code(
                buildOutputBucket,
                getRequiredParameter(ConfigParams.UNZIPPER_LAMBDA_KEY),
            ),
            runtime: Runtime.NodeJS810,
            handler: 'dist/index.handler',
            environment: {
                SOURCE_BUCKET_NAME: buildOutputBucket.bucketName,
            },
            timeout: 60,
        });
        unzipperLambda.addToRolePolicy(
            new PolicyStatement()
                .addAction('s3:GetObject')
                .addResource(buildOutputBucket.bucketArn)
                .addResource(`${buildOutputBucket.bucketArn}/*`)
        );
        unzipperLambda.addToRolePolicy(
            new PolicyStatement()
                .addAction('s3:DeleteObject')
                .addAction('s3:PutObject')
                .addResource(hostingBucket.bucketArn)
                .addResource(`${hostingBucket.bucketArn}/*`)
        );
        
        const unzipperCustomResource = new CfnResource(this, 'UnzipperCustomResource', {
            type: 'Custom::Unzipper',
            properties: {
                ServiceToken: unzipperLambda.functionArn,
                DestinationBucket: hostingBucket.bucketName,
                Key: getRequiredParameter(ConfigParams.WEBSITE_KEY),
            }
        });
        unzipperCustomResource.node.addDependency(unzipperLambda);

        const appRoot = 'index.html';
        const distribution = new CloudFrontWebDistribution(this, 'KgarsjoComDistribution', {
            defaultRootObject: appRoot,
            enableIpV6: true,
            errorConfigurations: [{
                errorCode: 404,
                responseCode: 200,
                responsePagePath: `/${appRoot}`,
            }],
            httpVersion: HttpVersion.HTTP2,
            priceClass: PriceClass.PriceClass100,
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
            viewerProtocolPolicy: ViewerProtocolPolicy.RedirectToHTTPS,
        });
        new CfnOutput(this, 'DistributionDomainName', {
            value: distribution.domainName
        });
    }
}