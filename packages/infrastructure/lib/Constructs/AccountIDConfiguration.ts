import { Construct, CfnMapping, Aws } from "@aws-cdk/core";

export type AccountIDConfigMap = { [accountID: string]: {
    domainName: string,
    sslCertificateARN: string
}};

export default class AccountIDConfiguration extends Construct {
    private accountIDConfigMapping: CfnMapping

    constructor(scope: Construct, accountIDConfiguration: AccountIDConfigMap) {
        super(scope, 'AccountIDConfiguration');
        this.accountIDConfigMapping =  new CfnMapping(this, 'Mapping', {
            mapping: accountIDConfiguration,
        });
    }

    getDomainName() {
        return this.accountIDConfigMapping.findInMap(Aws.ACCOUNT_ID, 'domainName');
    }
    
    getSSLCertificateArn() {
        return this.accountIDConfigMapping.findInMap(Aws.ACCOUNT_ID, 'sslCertificateARN');
    }
}