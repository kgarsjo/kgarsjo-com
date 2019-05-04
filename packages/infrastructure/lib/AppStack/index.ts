import { App, Stack } from '@aws-cdk/cdk';
import API from './API';
import { Dashboard } from '@aws-cdk/aws-cloudwatch';

export interface AppStackConfig {
    budgetSubscriberEmail: string,
}

export default class AppStack extends Stack {
    constructor(scope: App, name: string) {
        super(scope, name);

        const dashboard = new Dashboard(this, 'Kgarsjo.com');
        new API(this, dashboard);
    }
}