import { Database } from "~/lib/database.types";

import { SupabaseClient } from "@supabase/supabase-js";

export class OrganizationsRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>

    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

   async getAgencyForClient(clientOrganizationId: string, getForceClient = false): Promise<{
    id: string,
    name: string,
    email: string | null,
    picture_url: string | null
   }> {
    //Getting the client agency_id
    const { data: clientData, error: clientError } = await this.client
    .from('clients')
    .select('agency_id')
    .eq('organization_client_id', clientOrganizationId)
    .single();

    if(clientError?.code === 'PGRST116' && getForceClient) {
        const { data: agencyData, error: agencyError } = await this.client
        .from('accounts')
        .select('id, name, email, picture_url')
        .eq('id', clientOrganizationId)
        .eq('is_personal_account', false)
        .single();

        if(agencyError) throw agencyError;

        return agencyData;
    }

    if (clientError ?? !clientData) {
    console.error('Error fetching agency:', clientError);
    throw clientError;
    }

    // Retriving the corresponding agency => include also the subdomain param on the future
    const { data: agencyData, error: agencyError } = await this.client
    .from('accounts')
    .select('id, name, email, picture_url')
    .eq('id', clientData?.agency_id)
    .eq('is_personal_account', false)
    .single();

    if (agencyError ?? !agencyData) {
    console.error('Error fetching agency:', agencyError);
    throw agencyError;
    }

    return agencyData;
   }
}