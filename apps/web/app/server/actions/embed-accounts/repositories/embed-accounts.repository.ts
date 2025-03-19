import { EmbedAccounts } from '~/lib/embed-accounts.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { revalidatePath } from 'next/cache';
export class EmbedAccountsRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>
    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: EmbedAccounts.Insert[]): Promise<EmbedAccounts.Type[]> {
        const { data, error } = await this.client
            .from('embed_accounts')
            .insert(payload)
            .select()

        revalidatePath('/embeds');
        if (error) throw error;
        return data;
    }

    async update(embedId: string, accountIds: string[]): Promise<EmbedAccounts.Type[]> {
        const { data: existingRelations, error: fetchError } = await this.client
            .from('embed_accounts')
            .select('*')
            .eq('embed_id', embedId)
        
        if (fetchError) throw fetchError;
        
        const existingAccountIds = existingRelations.map(relation => relation.account_id as string);
        const accountIdsToDelete = existingAccountIds.filter(id => !accountIds.includes(id));
        const accountIdsToCreate = accountIds.filter(id => !existingAccountIds.includes(id));
        
        if (accountIdsToDelete.length > 0) {
            const { error: deleteError } = await this.client
                .from('embed_accounts')
                .delete()
                .eq('embed_id', embedId)
                .in('account_id', accountIdsToDelete);
            
            if (deleteError) throw deleteError;
        }
        
        if (accountIdsToCreate.length > 0) {
            const newRelations = accountIdsToCreate.map(accountId => ({
                embed_id: embedId,
                account_id: accountId
            }));
            
            const { error: createError } = await this.client
                .from('embed_accounts')
                .insert(newRelations);
            
            if (createError) throw createError;
        }
        
        const { data: updatedRelations, error: finalFetchError } = await this.client
            .from('embed_accounts')
            .select('*')
            .eq('embed_id', embedId)
        
        if (finalFetchError) throw finalFetchError;

        revalidatePath('/embeds');
        return updatedRelations;
    }

    async delete(embedAccountId: string): Promise<void> {
        const { error } = await this.client
            .from('embed_accounts')
            .delete()
            .eq('id', embedAccountId);

        revalidatePath('/embeds');
        if (error) throw error;
    }

    async get(embedAccountId: string): Promise<EmbedAccounts.Type> {
        const { data, error } = await this.client
            .from('embed_accounts')
            .select('*')
            .eq('id', embedAccountId)
            .single();

        if (error) throw error;
        return data;
    }

    async list(embedId: string): Promise<EmbedAccounts.Type[]> {
        const { data, error } = await this.client
            .from('embed_accounts')
            .select('*')
            .eq('embed_id', embedId)

        if (error) throw error;
        return data;
    }
}
