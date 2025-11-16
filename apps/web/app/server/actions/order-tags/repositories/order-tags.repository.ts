import { OrderTags } from '~/lib/order-tags.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';

export class OrderTagsRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>
    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: OrderTags.Insert): Promise<OrderTags.Type> {
        const { data: orderTagData, error: orderTagError } = await this.client
        .from('order_tags')
        .insert(payload)
        .select()
        .single();

        if (orderTagError) throw orderTagError;

        return orderTagData;
    }

    async delete(tagId: string): Promise<void> {
        const { error: orderTagError } = await this.client
        .from('order_tags')
        .delete()
        .eq('tag_id', tagId);

        if (orderTagError) throw orderTagError;
    }

    async get(orderId: number): Promise<OrderTags.Type[]> {
        const { data: orderTagData, error: orderTagError } = await this.client
        .from('order_tags')
        .select('*')
        .eq('order_id', orderId);

        if (orderTagError) throw orderTagError;

        return orderTagData;
    }

    async deleteManyByTagIds(orderId: number, tagIds: string[]): Promise<void> {
        const { error } = await this.client
            .from('order_tags')
            .delete()
            .in('tag_id', tagIds)
            .eq('order_id', orderId);

        if (error) throw error;
    }

    async createMany(orderTags: OrderTags.Insert[]): Promise<void> {
        const { error } = await this.client
            .from('order_tags')
            .insert(orderTags);

        if (error) throw error;
    }
}