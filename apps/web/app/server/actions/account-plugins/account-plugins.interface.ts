import { AccountPlugin, AccountPluginInsert, BillingAccountInsert } from "~/lib/plugins.types";
export interface IAccountPluginsAction {
    list(accountId: string, limit?: number, offset?: number): Promise<AccountPlugin[]>;
    create(payload: AccountPluginInsert): Promise<AccountPlugin>;
    update(id: string, payload: Partial<AccountPluginInsert> & {
        provider?: string;
        account_id?: string;
        provider_id?: string;
    }): Promise<AccountPlugin>;
    delete(id: string, accountId: string, provider: string): Promise<void>;
    get(id: string): Promise<AccountPlugin>;
}
