import { Subdomain } from '~/lib/subdomain.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { SubdomainsService } from '../services/subdomains.service';
import { SubdomainsRepository } from '../repositories/subdomains.repository';

export class SubdomainsController {
    private baseUrl: string
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>
    
    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: Subdomain.Insert): Promise<Subdomain.Type> {
        try {
            const subdomainsRepository = new SubdomainsRepository(this.client, this.adminClient);
            const subdomainsService = new SubdomainsService(subdomainsRepository);
            return await subdomainsService.create(payload);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async update(payload: Subdomain.Update, organizationId?: string): Promise<Subdomain.Type> {
        try {
            const subdomainsRepository = new SubdomainsRepository(this.client, this.adminClient);
            const subdomainsService = new SubdomainsService(subdomainsRepository);
            return await subdomainsService.update(payload, organizationId);
        } catch (error) {
            console.log(error); 
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const subdomainsRepository = new SubdomainsRepository(this.client, this.adminClient);
            const subdomainsService = new SubdomainsService(subdomainsRepository);
            return await subdomainsService.delete(id);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }   

    async get(ids: string[]): Promise<Subdomain.Type[]> {
        
        try {
            const subdomainsRepository = new SubdomainsRepository(this.client, this.adminClient);
            const subdomainsService = new SubdomainsService(subdomainsRepository);
            return await subdomainsService.get(ids);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async list(organizationId: string): Promise<Subdomain.Type[]> {
        try {
            const subdomainsRepository = new SubdomainsRepository(this.client, this.adminClient);
            const subdomainsService = new SubdomainsService(subdomainsRepository);
            return await subdomainsService.list(organizationId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
