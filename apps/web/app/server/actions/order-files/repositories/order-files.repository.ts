import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/lib/database.types";
import { OrderFiles } from "~/lib/order-files.types";

export class OrderFilesRepository {
    private client: SupabaseClient<Database> | null = null;
    private adminClient?: SupabaseClient<Database>;

    constructor(
        client: SupabaseClient<Database> | null, 
        adminClient?: SupabaseClient<Database>
    ) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async getOrderFiles(fileId: string, orderId: string): Promise<OrderFiles.Type> {
        const client = this.adminClient ?? this.client;

        if (!client) throw new Error('Client not found');

        const { data, error } = await client
        .from('order_files')
        .select('*')
        .eq('file_id', fileId)
        .eq('order_id', orderId)
        .single();

        if (error) throw error;

        return data as OrderFiles.Type;
    }
}