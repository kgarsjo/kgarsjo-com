import 'source-map-support/register';
import { App } from '@aws-cdk/cdk';
import AppStack from './AppStack';
import BootstrapStack from './Constructs/BootstrapStack';
import BudgetStack from './Constructs/BudgetStack';
import { TimeUnit, BudgetType } from './Constructs/Budget';

const config = {
    budgetLimit: {
        amount: 1,
        unit: 'USD',
    },
    budgetTimeUnit: TimeUnit.MONTHLY,
    budgetType: BudgetType.COST,
    budgetSubscriberEmail: 'krgarsjo@gmail.com',
    projectName: 'KgarsjoCom',
};

const app = new App();
new BootstrapStack(app, 'BootstrapStack', config);
new BudgetStack(app, 'BudgetStack', config);
new AppStack(app, 'AppStack');
