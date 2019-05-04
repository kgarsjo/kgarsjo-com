import 'source-map-support/register';
import { App } from '@aws-cdk/cdk';
import AppStack from './AppStack';
import CIStack from './CIStack';
import config from './config';
import BudgetStack from './BudgetStack';

const getStackName = (prefix: string) => (
    `${prefix}${config.stage}Stack`
);

const app = new App();
new AppStack(app, getStackName('KgarsjoComApp'));
new BudgetStack(app, getStackName('KgarsjoComBudget'), config);
new CIStack(app, getStackName('KgarsjoComCI'));
