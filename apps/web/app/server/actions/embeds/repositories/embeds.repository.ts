import { Embeds } from '~/lib/embeds.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { revalidatePath } from 'next/cache';

export class EmbedsRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>
    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: Embeds.Insert): Promise<Embeds.Type> {
        const { data: embedData, error: embedError } = await this.client
        .from('embeds')
        .insert(payload)
        .select()
        .single();

        revalidatePath('/embeds');
        if (embedError) throw embedError;
        return embedData;
    }

    async update(embedId: string, payload: Embeds.Update): Promise<Embeds.Type> {
        const { data: embedData, error: embedError } = await this.client
        .from('embeds')
        .update(payload)
        .eq('id', embedId)
        .select()
        .single();

        if (embedError) throw embedError;

        revalidatePath('/embeds');
        return embedData;
    }

    async delete(embedId: string): Promise<void> {
        const { error: embedError } = await this.client
        .from('embeds')
        .update({
            deleted_on: new Date().toISOString(),
        })
        .eq('id', embedId);
        revalidatePath('/embeds');
        if (embedError) throw embedError;
    }

    async get(embedId?: string): Promise<Embeds.TypeWithRelations> {
        const { data: embedData, error: embedError } = await this.client
        .from('embeds')
        .select('*, embed_accounts(*, accounts(id, picture_url, name, organization_settings(key, value)))')
        .eq('id', embedId ?? '')
        .is('deleted_on', null)
        .single();

        if (embedError) throw embedError;

        return {
            ...embedData,
            organizations: embedData?.embed_accounts?.map((embedAccount) => ({
                id: embedAccount?.account_id ?? '',
                name: embedAccount?.accounts?.organization_settings?.find((setting: { key: string, value: string }) => setting.key === 'name')?.value ?? embedAccount?.accounts?.name ?? '',
                picture_url: embedAccount?.accounts?.organization_settings?.find((setting: { key: string, value: string }) => setting.key === 'picture_url')?.value ?? embedAccount?.accounts?.picture_url ?? '',
            })),
        };
    }

    async list(organizationId?: string): Promise<Embeds.TypeWithRelations[]> {
        const query = this.client
        .from('embeds')
        .select('*, embed_accounts(*, accounts(id, picture_url, name, organization_settings(key, value)))')
        .is('deleted_on', null);

        const { data: embedData, error: embedError } = await query;

        if (embedError) throw embedError;

        let embedsFiltered = embedData;
        
        if(organizationId) {
            embedsFiltered = embedData?.filter((embed) => {
                return embed.visibility === 'public' || embed.embed_accounts?.some((embedAccount) => embedAccount.account_id === organizationId);
            });
        }

        return embedsFiltered?.map((embed) => ({
            ...embed,
            organizations: embed.embed_accounts?.map((embedAccount) => ({
                id: embedAccount?.account_id ?? '',
                name: embedAccount?.accounts?.organization_settings?.find((setting: { key: string, value: string }) => setting.key === 'name')?.value ?? embedAccount?.accounts?.name ?? '',
                picture_url: embedAccount?.accounts?.organization_settings?.find((setting: { key: string, value: string }) => setting.key === 'picture_url')?.value ?? embedAccount?.accounts?.picture_url ?? '',
            })),
        })) as Embeds.TypeWithRelations[];
    }
}
