import { Construct, Stack } from "@aws-cdk/cdk";
import Budget, {
    BudgetType,
    ComparisonOperator,
    NotificationType,
    SubscriptionType,
    ThresholdType,
    TimeUnit,
} from "../Constructs/Budget";

export interface AppBudgetProps {
    budgetSubscriberEmail: string,
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
    constructor(scope: Construct, id: string, props: AppBudgetProps) {
        super(scope, id);

        const { budgetSubscriberEmail: subscriberEmail } = props;
        new Budget(this, 'KgarsjoComBudget', {
            budgetName: 'KgarsjoComBudget',
            budgetType: BudgetType.COST,
            budgetLimit: {
                amount: 1,
                unit: 'USD',
            },
            timeUnit: TimeUnit.MONTHLY,
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