import { EmbedAccounts } from '~/lib/embed-accounts.types';
import { EmbedAccountsRepository } from '../repositories/embed-accounts.repository';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { EmbedAccountsService } from '../services/embed-accounts.service';

export class EmbedAccountsController {
    private baseUrl: string
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>

    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: EmbedAccounts.Insert[]): Promise<EmbedAccounts.Type[]> {
        try {
            const repository = new EmbedAccountsRepository(this.client, this.adminClient);
            const service = new EmbedAccountsService(repository);
            return await service.create(payload);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async update(embedId: string, accountIds: string[]): Promise<EmbedAccounts.Type[]> {
        try {
            const repository = new EmbedAccountsRepository(this.client, this.adminClient);
            const service = new EmbedAccountsService(repository);
            return await service.update(embedId, accountIds);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async delete(embedAccountId: string): Promise<void> {
        try {
            const repository = new EmbedAccountsRepository(this.client, this.adminClient);
            const service = new EmbedAccountsService(repository);
            return await service.delete(embedAccountId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async get(embedAccountId: string): Promise<EmbedAccounts.Type> {
        try {
            const repository = new EmbedAccountsRepository(this.client, this.adminClient);
            const service = new EmbedAccountsService(repository);
            return await service.get(embedAccountId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async list(embedId: string): Promise<EmbedAccounts.Type[]> {
        try {
            const repository = new EmbedAccountsRepository(this.client, this.adminClient);
            const service = new EmbedAccountsService(repository);
            return await service.list(embedId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
