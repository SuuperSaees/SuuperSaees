import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../../../lib/database.types";
import { Session } from "../../../../../lib/account.types";
import { AccountsRepository } from "../repositories/accounts.repository";
import { AccountsService } from "../services/accounts.service";

export class AccountsController {
    private baseUrl: string;
    private client: SupabaseClient<Database>;
    private adminClient: SupabaseClient<Database>;

    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient: SupabaseClient<Database>) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

    async getSession(): Promise<Session.Type> {
        try {
            const accountsRepository = new AccountsRepository(this.client, this.adminClient);
            const accountsService = new AccountsService(accountsRepository);
            return await accountsService.getSession();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getUserRole(): Promise<string> {
        try {
            const accountsRepository = new AccountsRepository(this.client, this.adminClient);
            const accountsService = new AccountsService(accountsRepository);
            return await accountsService.getUserRole();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    
}

