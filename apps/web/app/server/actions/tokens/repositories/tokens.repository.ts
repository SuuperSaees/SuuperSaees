import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/lib/database.types";
import { Tokens } from "~/lib/tokens.types";

export class TokensRepository {
    constructor(private baseUrl: string, private client: SupabaseClient<Database>, private adminClient: SupabaseClient<Database>) {
    }

    async createToken(payload: Tokens.Insert) {
        const {data} = await this.client.from('tokens')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
        return data;
    }

    async getTokenById(id: string) {
        const {data, error} = await this.client.from('tokens')
        .select('*')
        .eq('id', id)
        .single();
        if (error && data) throw error;
        return data;
    }
}