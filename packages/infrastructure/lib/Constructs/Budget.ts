import { Construct } from "@aws-cdk/core";
import { CfnBudget, CfnBudgetProps } from "@aws-cdk/aws-budgets";

export enum BudgetType {
    COST = 'COST',
    RI_COVERAGE = 'RI_COVERAGE',
    RI_UTILIZATION = 'RI_UTILIZATION',
    USAGE = 'USAGE',
}

export enum ComparisonOperator {
    EQUAL_TO = 'EQUAL_TO',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN',
}

export enum NotificationType {
    ACTUAL = 'ACTUAL',
    FORECASTED = 'FORECASTED',
}

export enum SubscriptionType {
    EMAIL = 'EMAIL',
    SNS = 'SNS',
}

export enum ThresholdType {
    ABSOLUTE_VALUE = 'ABSOLUTE_VALUE',
    PERCENTAGE = 'PERCENTAGE',
}

export enum TimeUnit {
    DAILY = 'DAILY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    ANNUALLY = 'ANNUALLY',
}

export interface BudgetProps {
    readonly budgetLimit?: CfnBudget.SpendProperty,
    readonly budgetName?: string,
    readonly budgetType: BudgetType,
    readonly costFilters?: object,
    readonly costTypes?: CfnBudget.CostTypesProperty,
    readonly notificationsWithSubscribers?: Array<CfnBudget.NotificationWithSubscribersProperty>,
    readonly timePeriod?: CfnBudget.TimePeriodProperty,
    readonly timeUnit: TimeUnit,
}

const getCfnBudgetProps = ({
    notificationsWithSubscribers,
    ...rest
}: BudgetProps): CfnBudgetProps => ({
    budget: rest,
    notificationsWithSubscribers,
});

export default class Budget {
    constructor(scope: Construct, id: string, budgetProps: BudgetProps) {
        new CfnBudget(scope, id, getCfnBudgetProps(budgetProps));
    }
}