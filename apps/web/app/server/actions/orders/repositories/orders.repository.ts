import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/lib/database.types";
import { Order } from "~/lib/order.types";

export class OrdersRepository {
    private client: SupabaseClient<Database> | null = null;
    private adminClient?: SupabaseClient<Database>;

    constructor(
        client: SupabaseClient<Database> | null, 
        adminClient?: SupabaseClient<Database>
    ) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async getPublicOrderById(orderId: number): Promise<Order.Type> {
        const client = this.adminClient ?? this.client;
        if (!client) throw new Error('Client not found');
        const { data: orderData, error: orderError } = await client
            .from('orders_v2')
            .select(
                `*, 
                client:accounts!customer_id(
                    id, name, email, picture_url, organization_id, created_at, 
                    settings:user_settings(name, picture_url)
                ), 
                messages(
                    *, 
                    user:accounts(
                        id, name, email, picture_url, 
                        settings:user_settings(name, picture_url)
                    ), 
                    files(*)
                ), 
                activities(
                    *, 
                    user:accounts(
                        id, name, email, picture_url, 
                        settings:user_settings(name, picture_url)
                    )
                ),
                reviews(
                    *, 
                    user:accounts(
                        id, name, email, picture_url, 
                        settings:user_settings(name, picture_url)
                    )
                ), 
                files(
                    *, 
                    user:accounts(
                        id, name, email, picture_url, 
                        settings:user_settings(name, picture_url)
                    )
                ),
                assigned_to:order_assignations(
                    agency_member:accounts(
                        id, name, email, picture_url, 
                        settings:user_settings(name, picture_url)
                    )
                ),
                followers:order_followers(
                    client_follower:accounts(
                        id, name, email, picture_url, 
                        settings:user_settings(name, picture_url)
                    )
                )`
            )
            .eq('id', orderId)
            .eq('visibility', 'public')
            .single();

        if (orderError) throw orderError;
        if (!orderData) throw new Error('Order not found or not public');

        // Fetch client organization
        const { data: clientOrganizationData, error: clientOrganizationError } = 
            await client
                .from('accounts')
                .select('name, slug')
                .eq('id', orderData.client_organization_id)
                .single();

        if (clientOrganizationError) throw clientOrganizationError;

        return {
            ...orderData,
            messages: orderData.messages.map((message) => ({
                ...message,
                user: message.user,
            })),
            client_organization: clientOrganizationData,
        } as Order.Type;
    }

    async getOrder(orderId: string): Promise<Order.Type> {
        const client = this.adminClient ?? this.client;

        if (!client) throw new Error('Client not found');

        const { data: orderData, error: orderError } = await client
            .from('orders_v2')
            .select('uuid, id')
            .eq('id', orderId)
            .single();

        if (orderError) throw orderError;
        
        if (!orderData) throw new Error('Order not found');

        return orderData as Order.Type;
    }
}