import { BaseAction } from "../base-action";
import { AccountPluginsController } from "./controllers/account-plugins.controller";
import {  AccountPlugin,
    AccountPluginInsert } from "~/lib/plugins.types";
import { IAccountPluginsAction } from "./account-plugins.interface";

class AccountPluginsAction extends BaseAction implements IAccountPluginsAction {
    private controller: AccountPluginsController;
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new AccountPluginsController(this.baseUrl, this.client, this.adminClient);
    }

    async list(  accountId: string,
        limit = 10,
        offset = 0
    ): Promise<AccountPlugin[]> {
        return await this.controller.list(accountId, limit, offset);
    }

    async create(payload: AccountPluginInsert): Promise<AccountPlugin> {
        return await this.controller.create(payload);
    }

    async update(id: string, payload: Partial<AccountPluginInsert> & {
        provider?: string;
        provider_id?: string;
      }): Promise<AccountPlugin> {
        return await this.controller.update(id, payload);
    }

    async delete(
        id: string,
        accountId: string,
        provider: string,): Promise<void> {
        return await this.controller.delete(id, accountId, provider);
    }

    async get(id?: string, name?: string): Promise<AccountPlugin> {
        return await this.controller.get(id, name);
    }
}

export function createAccountPluginsAction(baseUrl: string) {
    return new AccountPluginsAction(baseUrl);
}