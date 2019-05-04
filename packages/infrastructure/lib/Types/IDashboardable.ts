import { IWidget } from "@aws-cdk/aws-cloudwatch";

export interface IDashboardable {
    getDashboardWidgets(): Array<IWidget>,
}