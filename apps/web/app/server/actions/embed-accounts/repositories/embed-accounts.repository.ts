import { EmbedAccounts } from '~/lib/embed-accounts.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';

export class EmbedAccountsRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>
    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: EmbedAccounts.Insert[]): Promise<EmbedAccounts.Type> {
        const { data, error } = await this.client
            .from('embed_accounts')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(embedAccountId: string, payload: EmbedAccounts.Update): Promise<EmbedAccounts.Type> {
        const { data, error } = await this.client
            .from('embed_accounts')
            .update(payload)
            .eq('id', embedAccountId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(embedAccountId: string): Promise<void> {
        const { error } = await this.client
            .from('embed_accounts')
            .delete()
            .eq('id', embedAccountId);

        if (error) throw error;
    }

    async get(embedAccountId: string): Promise<EmbedAccounts.Type> {
        const { data, error } = await this.client
            .from('embed_accounts')
            .select('*')
            .eq('id', embedAccountId)
            .is('deleted_on', null)
            .single();

        if (error) throw error;
        return data;
    }

    async list(embedId: string): Promise<EmbedAccounts.Type[]> {
        const { data, error } = await this.client
            .from('embed_accounts')
            .select('*')
            .eq('embed_id', embedId)
            .is('deleted_on', null);

        if (error) throw error;
        return data;
    }
}
