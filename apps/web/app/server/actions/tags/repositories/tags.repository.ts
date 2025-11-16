import { Tags } from '~/lib/tags.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';

export class TagsRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>
    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: Tags.Insert): Promise<Tags.Type> {
        const { data: tagData, error: tagError } = await this.client
        .from('tags')
        .insert(payload)
        .select()
        .single();

        if (tagError) throw tagError;
        return tagData;
    }

    async update(payload: Tags.Update): Promise<Tags.Type> {
        const { data: tagData, error: tagError } = await this.client
        .from('tags')
        .update(payload)
        .eq('id', payload.id ?? '')
        .select()
        .single();

        if (tagError) throw tagError;

        return tagData;
    }

    async delete(id: string): Promise<void> {
        const { error: tagError } = await this.client
        .from('tags')
        .update({
            deleted_on: new Date().toISOString(),
        })
        .eq('id', id);

        if (tagError) throw tagError;
    }

    async get(id: string[]): Promise<Tags.Type[]> {
        const { data: tagData, error: tagError } = await this.client
        .from('tags')
        .select('*')
        .in('id', id)
        .is('deleted_on', null);

        if (tagError) throw tagError;

        return tagData;
    }

    async list(organizationId: string): Promise<Tags.Type[]> {

        const { data: tagData, error: tagError } = await this.client
        .from('tags')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_on', null);

        if (tagError) throw tagError;

        return tagData;
    }
}