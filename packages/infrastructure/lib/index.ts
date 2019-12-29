import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import AppStack from './AppStack';
import BootstrapStack from './Constructs/BootstrapStack';
import BudgetStack from './Constructs/BudgetStack';
import { TimeUnit, BudgetType } from './Constructs/Budget';
import SSLCertStack from './SSLCertStack';

const config = {
    budgetLimit: {
        amount: 1,
        unit: 'USD',
    },
    budgetTimeUnit: TimeUnit.MONTHLY,
    budgetType: BudgetType.COST,
    budgetSubscriberEmail: 'krgarsjo@gmail.com',
    accountIDConfiguration: {
        '144053636142': {   // kgarsjocom-beta
            domainName: 'beta.kgarsjo.com',
            sslCertificateARN: 'arn:aws:acm:us-east-1:144053636142:certificate/0f8f3cbb-19aa-4fb2-924c-c0c727e11378',
        },
        '901675770819': {   // kgarsjocom-prod
            domainName: 'www.kgarsjo.com',
            sslCertificateARN: 'arn:aws:acm:us-east-1:901675770819:certificate/b6544272-4c30-4ddf-bea2-ce83ac4da2fc',
        },
    },
    projectName: 'KgarsjoCom',
};

const app = new App();
new BootstrapStack(app, 'BootstrapStack', config);
new BudgetStack(app, 'BudgetStack', config);
new SSLCertStack(app, 'SSLCertStack', config);
new AppStack(app, 'AppStack', config);
