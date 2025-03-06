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
        .select('*, embed_accounts(*, accounts(id, picture_url, name, organization_settings(key, value)))')
        .eq('id', embedId ?? '')
        .is('deleted_on', null)
        .single();

        if (embedError) throw embedError;

        return {
            ...embedData,
            organizations: embedData?.embed_accounts?.map((embedAccount) => ({
                id: embedAccount?.account_id ?? '',
                name: embedAccount?.accounts?.organization_settings?.find((setting: { key: string, value: string }) => setting.key === 'name')?.value ?? '',
                picture_url: embedAccount?.accounts?.organization_settings?.find((setting: { key: string, value: string }) => setting.key === 'picture_url')?.value ?? '',
            })),
        };
    }

    async list(organizationId?: string, role?: string, agencyId?: string): Promise<Embeds.TypeWithRelations[]> {
        const agencyRoles = new Set(['agency_owner', 'agency_member', 'agency_project_manager']);
        const clientRoles = new Set(['client_owner', 'client_member', 'client_guest']);

        const isClient = clientRoles.has(role ?? '');
        if(isClient && !agencyId) {
            throw new Error('Agency ID is required for client role');
        }

        const isAgency = agencyRoles.has(role ?? '');

        if(isAgency && !organizationId) {
            throw new Error('Organization ID is required for agency role');
        }

        if(isClient){
            const { data: embedData, error: embedError } = await this.client
            .from('embeds')
            .select(`
                *,
                embed_accounts!inner(*)
            `)
            .eq('organization_id', agencyId ?? '')
            .is('deleted_on', null)
            .or(`visibility.neq.private, and(visibility.eq.private, embed_accounts.account_id.eq.${organizationId})`)

            if (embedError && embedError.code !== 'PGRST116') throw embedError;

            const uniqueEmbeds = Array.from(
                new Map(embedData?.map(embed => [embed.id, embed])).values()
            );

            return uniqueEmbeds ?? [];
        }

        const { data: embedData, error: embedError } = await this.client
        .from('embeds')
        .select('*')
        .eq('organization_id', organizationId ?? '')
        .is('deleted_on', null);

        if (embedError && embedError.code !== 'PGRST116') throw embedError;

        return embedData ?? [];
    }
}
