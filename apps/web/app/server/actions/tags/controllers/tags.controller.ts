import { Tags } from '~/lib/tags.types';
import { TagsRepository } from '../repositories/tags.repository';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { TagsService } from '../services/tags.service';
import { OrderTagsRepository } from '../../order-tags/repositories/order-tags.repository';
export class TagsController {
    private baseUrl: string
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>

    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: Tags.Insert, orderId?: number): Promise<Tags.Type> {
        try {
            const tagsRepository = new TagsRepository(this.client, this.adminClient);
            const orderTagsRepository = new OrderTagsRepository(this.client, this.adminClient);
            const tagsService = new TagsService(tagsRepository, orderTagsRepository);
            return await tagsService.create(payload, orderId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async update(payload: Tags.Update): Promise<Tags.Type> {
        try {
            const tagsRepository = new TagsRepository(this.client, this.adminClient);
            const tagsService = new TagsService(tagsRepository);
            return await tagsService.update(payload);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const tagsRepository = new TagsRepository(this.client, this.adminClient);
            const orderTagsRepository = new OrderTagsRepository(this.client, this.adminClient);
            const tagsService = new TagsService(tagsRepository, orderTagsRepository);
            return await tagsService.delete(id);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async get(ids: string[]): Promise<Tags.Type[]> {
        try {
            const tagsRepository = new TagsRepository(this.client, this.adminClient);
            const tagsService = new TagsService(tagsRepository);
            return await tagsService.get(ids);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async list(organizationId: string, orderId?: number): Promise<Tags.Type[]> {
        try {
            const tagsRepository = new TagsRepository(this.client, this.adminClient);
            const orderTagsRepository = new OrderTagsRepository(this.client, this.adminClient);
            const tagsService = new TagsService(tagsRepository, orderTagsRepository);
            return await tagsService.list(organizationId, orderId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
