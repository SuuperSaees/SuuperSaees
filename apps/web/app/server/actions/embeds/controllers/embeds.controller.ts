import { Embeds } from '~/lib/embeds.types';
import { EmbedsRepository } from '../repositories/embeds.repository';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { EmbedsService } from '../services/embeds.service';
import { EmbedAccountsRepository } from '../../embed-accounts/repositories/embed-accounts.repository';
import { SecurityService } from "../../security/services/security.service";

export class EmbedsController {
    private baseUrl: string
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>

    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: Embeds.Insert, accountIds?: string[]): Promise<Embeds.Type> {
        try {
            const embedsRepository = new EmbedsRepository(this.client, this.adminClient);
            const embedAccountsRepository = new EmbedAccountsRepository(this.client, this.adminClient);
            const securityService = new SecurityService();
            
            // Sanitize and validate the payload
            await securityService.validateEmbedData(payload);
            
            // Now payload has been sanitized, we can proceed with creation
            const embedsService = new EmbedsService(embedsRepository, embedAccountsRepository);
            return await embedsService.create(payload, accountIds);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async update(embedId: string, payload: Embeds.Update, accountIds?: string[]): Promise<Embeds.Type> {
        try {
            const embedsRepository = new EmbedsRepository(this.client, this.adminClient);
            const embedAccountsRepository = new EmbedAccountsRepository(this.client, this.adminClient);
            const securityService = new SecurityService();
            
            // Sanitize and validate the payload
            await securityService.validateEmbedData(payload);
            
            // Now payload has been sanitized, we can proceed with update
            const embedsService = new EmbedsService(embedsRepository, embedAccountsRepository);
            return await embedsService.update(embedId, payload, accountIds);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async delete(embedId: string): Promise<void> {
        try {
            const embedsRepository = new EmbedsRepository(this.client, this.adminClient);
            const embedsService = new EmbedsService(embedsRepository);
            return await embedsService.delete(embedId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async get(embedId?: string): Promise<Embeds.TypeWithRelations> {
        try {
            const embedsRepository = new EmbedsRepository(this.client, this.adminClient);
            const embedsService = new EmbedsService(embedsRepository);
            return await embedsService.get(embedId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async list(organizationId?: string): Promise<Embeds.TypeWithRelations[]> {
        try {
            const embedsRepository = new EmbedsRepository(this.client, this.adminClient);
            const embedsService = new EmbedsService(embedsRepository);
            return await embedsService.list(organizationId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
