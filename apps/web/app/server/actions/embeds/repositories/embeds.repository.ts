import { Embeds } from '~/lib/embeds.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';

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

        return embedData;
    }

    async delete(embedId: string): Promise<void> {
        const { error: embedError } = await this.client
        .from('embeds')
        .update({
            deleted_on: new Date().toISOString(),
        })
        .eq('id', embedId);

        if (embedError) throw embedError;
    }

    async get(embedId?: string): Promise<Embeds.TypeWithRelations> {
        const { data: embedData, error: embedError } = await this.client
        .from('embeds')
        .select('*, embed_accounts(*, accounts(id, picture_url, name, organizations_settings(*)))')
        .eq('id', embedId ?? '')
        .is('deleted_on', null)
        .single();

        if (embedError) throw embedError;

        return {
            ...embedData,
            organizations: []
            // organizations: embedData?.embed_accounts?.map((embedAccount) => ({
            //     id: embedAccount?.account_id,
            //     name: embedAccount?.accounts?.organizations_settings?.find((setting: { key: string, value: string }) => setting.key === 'name')?.value,
            //     picture_url: embedAccount?.accounts?.organizations_settings?.find((setting: { key: string, value: string }) => setting.key === 'picture_url')?.value,
            // })),
        };
    }

    async list(organizationId: string): Promise<Embeds.Type[]> {
        const { data: embedData, error: embedError } = await this.client
        .from('embeds')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_on', null);

        if (embedError) throw embedError;

        return embedData;
    }
}
