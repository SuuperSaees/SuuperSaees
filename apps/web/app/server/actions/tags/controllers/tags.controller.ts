import { Tags } from '~/lib/tags.types';
import { TagsRepository } from '../repositories/tags.repository';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { TagsService } from '../services/tags.service';
export class TagsController {
    private baseUrl: string
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>

    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: Tags.Insert): Promise<void> {
        const tagsRepository = new TagsRepository(this.client, this.adminClient);
        const tagsService = new TagsService(tagsRepository);
        return await tagsService.create(payload);
    }

    async update(payload: Tags.Update): Promise<void> {
        const tagsRepository = new TagsRepository(this.client, this.adminClient);
        const tagsService = new TagsService(tagsRepository);
        return await tagsService.update(payload);
    }

    async delete(id: string): Promise<void> {
        const tagsRepository = new TagsRepository(this.client, this.adminClient);
        const tagsService = new TagsService(tagsRepository);
        return await tagsService.delete(id);
    }

    async get(id: string): Promise<Tags.Type> {
        const tagsRepository = new TagsRepository(this.client, this.adminClient);
        const tagsService = new TagsService(tagsRepository);
        return await tagsService.get(id);
    }

    async list(organizationId: string): Promise<Tags.Type[]> {
        const tagsRepository = new TagsRepository(this.client, this.adminClient);
        const tagsService = new TagsService(tagsRepository);
        return await tagsService.list(organizationId);
    }
}
