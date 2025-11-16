import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../../../lib/database.types';
import { Session } from '../../../../../lib/account.types';

export class AccountsRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>
    
    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async getSession(): Promise<Session.Type> {
        const { data, error } = await this.client.rpc('get_session');
        
        if (error) throw error;
        return data;
    }

    async getUserRole(): Promise<string> {
        const { data, error } = await this.client.rpc('get_current_role');
        if (error) throw error;
        return data;
    }
} 