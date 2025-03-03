import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/lib/database.types";
import { Subdomain } from "~/lib/subdomain.types";

export class SubdomainsRepository {
    private client: SupabaseClient<Database>;
    private adminClient?: SupabaseClient<Database>;

    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async create(payload: Subdomain.Insert): Promise<Subdomain.Type> {
        const { data: subdomainData, error: subdomainError } = await this.client
        .from('subdomains')
        .insert(payload)
        .select()
        .single();

        if (subdomainError) throw subdomainError;

        return subdomainData;
    }

    async update(payload: Subdomain.Update, organizationId?: string): Promise<Subdomain.Type> {
        // get domain id
        let domainId = payload.id;

        if(!domainId){
            const { data: subdomainData, error: subdomainError } = await this.client
            .from('organization_subdomains')
            .select('subdomain_id')
            .eq('organization_id', organizationId ?? '')
            .single();

            if (subdomainError) throw subdomainError;

            domainId = subdomainData.subdomain_id;
        }

        // Validar si el subdominio ya está en uso
        if (payload.domain) {
            const { data: existingDomain, error: existingError } = await this.client
                .from('subdomains')
                .select('id')
                .eq('domain', payload.domain)
                .is('deleted_on', null)
                .neq('id', domainId)
                .single();

            if (existingError && existingError.code !== 'PGRST116') {
                throw existingError;
            }

            if (existingDomain) {
                throw new Error('Subdomain already in use');
            }
        }
        
        const { data: subdomainData, error: subdomainError } = await this.client
        .from('subdomains')
        .update(payload)
        .eq('id', domainId)
        .select()
        .single();

        if (subdomainError) throw subdomainError;

        return subdomainData;
    }

    async delete(id: string): Promise<void> {
        const { error: subdomainError } = await this.client
        .from('subdomains')
        .update({
            deleted_on: new Date().toISOString(),
        })
        .eq('id', id);

        if (subdomainError) throw subdomainError;
    }

    async get(ids: string[]): Promise<Subdomain.Type[]> {
        const { data: subdomainData, error: subdomainError } = await this.client
        .from('subdomains')
        .select('*')
        .in('id', ids)
        .is('deleted_on', null);

        if (subdomainError) throw subdomainError;

        return subdomainData;
    }

    async list(organizationId: string): Promise<Subdomain.Type[]> {
        const { data: subdomainData, error: subdomainError } = await this.client
        .from('subdomains')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

        if (subdomainError) throw subdomainError;

        return subdomainData;
    }
    
}
