// import { BaseAction } from '../base-action';
import { AccountsController } from './controllers/accounts.controller';
import { IAccountsAction } from './accounts.interface';
import { Session } from '../../../../lib/account.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../../lib/database.types';

export class AccountsAction implements IAccountsAction {
    private controller: AccountsController;
    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient: SupabaseClient<Database>) {
        this.controller = new AccountsController(baseUrl, client, adminClient);
    }

    async getSession(): Promise<Session.Type> {
        return await this.controller.getSession();
    }

    async getUserRole(): Promise<string> {
        return await this.controller.getUserRole();
    }
}

export function createAccountsAction(baseUrl: string, client: SupabaseClient<Database>, adminClient: SupabaseClient<Database>) {
    return new AccountsAction(baseUrl, client, adminClient);
}
