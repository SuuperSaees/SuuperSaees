import { AccountPlugin, AccountPluginInsert } from "~/lib/plugins.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/lib/database.types";
import { AccountPluginsRepository } from "../repositories/account-plugins.repository";
import { AccountPluginsService } from "../services/account-plugins.service";
import { PluginsRepository } from "../../plugins/repositories/plugins.repository";

export class AccountPluginsController {
    private baseUrl: string;
    private client: SupabaseClient<Database>;
    private adminClient?: SupabaseClient<Database>;

    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

    async list(accountId: string, limit?: number, offset?: number): Promise<AccountPlugin[]> {
        try {
            const accountPluginRepository = new AccountPluginsRepository(this.client, this.adminClient);
            const accountPluginService = new AccountPluginsService(accountPluginRepository);
            return await accountPluginService.list(accountId, limit, offset);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async create(payload: AccountPluginInsert): Promise<AccountPlugin> {
        try {
            const accountPluginRepository = new AccountPluginsRepository(this.client, this.adminClient);
            const pluginsRepository = new PluginsRepository(this.client, this.adminClient);
            const accountPluginService = new AccountPluginsService(accountPluginRepository, pluginsRepository);
            return await accountPluginService.create(payload);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async update(id: string, payload: Partial<AccountPluginInsert> & {
        provider?: string;
        provider_id?: string;
    }): Promise<AccountPlugin> {
        try {
            const accountPluginRepository = new AccountPluginsRepository(this.client, this.adminClient);
            const accountPluginService = new AccountPluginsService(accountPluginRepository);
            return await accountPluginService.update(id, payload);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async delete(id: string, accountId: string, provider: string): Promise<void> {
        try {
            const accountPluginRepository = new AccountPluginsRepository(this.client, this.adminClient);
            const accountPluginService = new AccountPluginsService(accountPluginRepository);
            return await accountPluginService.delete(id, accountId, provider);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async get(id?: string, name?: string): Promise<AccountPlugin> {
        try {
            const accountPluginRepository = new AccountPluginsRepository(this.client, this.adminClient);
            const accountPluginService = new AccountPluginsService(accountPluginRepository);
            return await accountPluginService.get(id, name);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
