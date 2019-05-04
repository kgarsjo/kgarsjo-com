import { Stack, Construct } from "@aws-cdk/cdk";
import { User } from "@aws-cdk/aws-iam";

export default class CIStack extends Stack {
    constructor(parent: Construct, id: string) {
        super(parent, id);

       const ciUser = new User(this, 'KgarsjoComCIUser');
       ciUser.attachManagedPolicy('arn:aws:iam::aws:policy/AdministratorAccess');
    }
}