import { RestApi, RestApiProps } from "@aws-cdk/aws-apigateway";
import { Construct } from "@aws-cdk/cdk";
import { IDashboardable } from "../Types/IDashboardable";
import { IWidget } from "@aws-cdk/aws-cloudwatch";

export default class RestAPI extends RestApi implements IDashboardable {
    private props: RestApiProps;

    constructor(scope: Construct, id: string, props?: RestApiProps) {
        super(scope, id, props);
        this.props = props || {};
    }

    get restApiName(): string {
        const { restApiName } = this.props;
        return restApiName || this.restApiId;
    }

    getDashboardWidgets(): Array<IWidget> {
        return [];
    }
}