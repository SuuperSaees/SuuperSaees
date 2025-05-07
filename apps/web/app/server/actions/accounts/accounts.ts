import { BaseAction } from '../base-action';
import { AccountsController } from './controllers/accounts.controller';
import { IAccountsAction } from './accounts.interface';
import { Session } from '~/lib/account.types';

export class AccountsAction extends BaseAction implements IAccountsAction {
    private controller: AccountsController;
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new AccountsController(this.baseUrl, this.client, this.adminClient);
    }

    async getSession(): Promise<Session.Type> {
        return await this.controller.getSession();
    }
}

export function createAccountsAction(baseUrl: string) {
    return new AccountsAction(baseUrl);
}
