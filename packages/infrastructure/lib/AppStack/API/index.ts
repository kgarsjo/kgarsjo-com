import { Construct } from '@aws-cdk/cdk';
import RestAPI from '../../Constructs/RestAPI';
import { MockIntegration, PassthroughBehavior, EmptyModel } from '@aws-cdk/aws-apigateway';
import { HTTPStatus } from '../../Constants/HTTPStatus';
import { Dashboard } from '@aws-cdk/aws-cloudwatch';

export default class API extends Construct  {
    constructor(parent: Construct, dashboard: Dashboard) {
        super(parent, 'KgarsjoAPI');

        const api = new RestAPI(this, 'KgarsjoApi', {
            restApiName: 'KgarsjoAPI',
        });
        dashboard.add(...api.getDashboardWidgets());

        const mockIntegration =  new MockIntegration({
            integrationResponses: [
                {
                  statusCode: HTTPStatus.OK,
                  responseParameters: {
                    "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                    "method.response.header.Access-Control-Allow-Methods": "'GET,POST,OPTIONS'",
                    "method.response.header.Access-Control-Allow-Origin": "'*'"
                  },
                  responseTemplates: {
                    "application/json": ""
                  }
                }
              ],
              passthroughBehavior: PassthroughBehavior.Never,
              requestTemplates: {
                "application/json": "{\"statusCode\": 200}"
              },
        });

        api.root.addResource('health').addMethod('POST', mockIntegration, {
            methodResponses: [{
                statusCode: HTTPStatus.OK,
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': true,
                    'method.response.header.Access-Control-Allow-Methods': true,
                    'method.response.header.Access-Control-Allow-Origin': true
                },
                responseModels: {
                    'application/json': new EmptyModel(),
                },
            }],
        });
    }
}