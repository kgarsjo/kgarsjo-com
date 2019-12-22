import 'source-map-support/register';
import { App } from '@aws-cdk/cdk';
import AppStack from './AppStack';
import CIStack from './CIStack';
import config from './config';
import BudgetStack from './BudgetStack';

const app = new App();
new AppStack(app, 'KgarsjoComAppStack');
new BudgetStack(app, 'KgarsjoComBudgetStack', config);
new CIStack(app, 'KgarsjoComCIStack');
