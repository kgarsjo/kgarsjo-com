import { Construct, Stack } from "@aws-cdk/cdk";
import Budget, {
    BudgetType,
    ComparisonOperator,
    NotificationType,
    SubscriptionType,
    ThresholdType,
    TimeUnit,
} from "../Budget";
import { CfnBudget } from "@aws-cdk/aws-budgets";

export interface BudgetProps {
    budgetSubscriberEmail: string,
    budgetLimit: CfnBudget.SpendProperty,
    budgetTimeUnit: TimeUnit,
    budgetType: BudgetType,
    projectName: string,
};

interface OverBudgetNotificationProps {
    notificationType: NotificationType,
    subscriberEmail: string,
}
const getOverBudgetNotification = ({ notificationType, subscriberEmail }: OverBudgetNotificationProps) => ({
    notification: {
        notificationType: notificationType,
        comparisonOperator: ComparisonOperator.GREATER_THAN,
        threshold: 0,
        thresholdType: ThresholdType.ABSOLUTE_VALUE,
    },
    subscribers: [{
        address: subscriberEmail,
        subscriptionType: SubscriptionType.EMAIL,
    }],
});

export default class BudgetStack extends Stack {
    constructor(scope: Construct, id: string, props: BudgetProps) {
        super(scope, id);

        const {
            budgetLimit,
            budgetTimeUnit: timeUnit,
            budgetType,
            budgetSubscriberEmail: subscriberEmail,
            projectName,
        } = props;
        new Budget(this, `${projectName}Budget`, {
            budgetName: `${projectName}Budget`,
            budgetType,
            budgetLimit,
            timeUnit,
            notificationsWithSubscribers: [
                getOverBudgetNotification({
                    notificationType: NotificationType.FORECASTED,
                    subscriberEmail,
                }),
                getOverBudgetNotification({
                    notificationType: NotificationType.ACTUAL,
                    subscriberEmail,
                }),
            ],
        });
    }
}