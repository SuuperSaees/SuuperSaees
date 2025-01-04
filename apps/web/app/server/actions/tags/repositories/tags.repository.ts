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

    async create(payload: Tags.Insert): Promise<void> {
        const { data: tagData, error: tagError } = await this.client.from('tags').insert(payload);
        if (tagError) throw tagError;
    }

    async update(payload: Tags.Update): Promise<void> {
        const { data: tagData, error: tagError } = await this.client.from('tags').update(payload).eq('id', payload.id);
        if (tagError) throw tagError;
    }

    async delete(id: string): Promise<void> {
        const { error: tagError } = await this.client.from('tags').delete().eq('id', id);
        if (tagError) throw tagError;
    }

    async get(id: string): Promise<Tags.Type> {
        const { data: tagData, error: tagError } = await this.client.from('tags').select('*').eq('id', id).single();
        if (tagError) throw tagError;
        return tagData;
    }

    async list(organizationId: string): Promise<Tags.Type[]> {
        const { data: tagData, error: tagError } = await this.client.from('tags').select('*').eq('organization_id', organizationId);
        if (tagError) throw tagError;
        return tagData;
    }
}