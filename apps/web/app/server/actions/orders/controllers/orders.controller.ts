import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { OrdersService } from '../services/orders.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderTagsRepository } from '../../order-tags/repositories/order-tags.repository';
import { Order } from '~/lib/order.types';

export class OrdersController {
    private baseUrl: string;
    private client: SupabaseClient<Database> | null = null;
    private adminClient?: SupabaseClient<Database>;

    constructor(
        baseUrl: string, 
        client: SupabaseClient<Database> | null, 
        adminClient?: SupabaseClient<Database>
    ) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

    async getPublicOrderById(orderId: number): Promise<Order.Type> {
        const orderRepository = new OrdersRepository(this.client, this.adminClient);
        const orderService = new OrdersService(orderRepository);
        return orderService.getPublicOrderById(orderId);
    }

    async updateOrderTags(orderId: number, tagIds: string[]): Promise<void> {
        const orderTagsRepository = new OrderTagsRepository(this.client as SupabaseClient<Database>, this.adminClient as SupabaseClient<Database>);
        const orderRepository = new OrdersRepository(this.client, this.adminClient as SupabaseClient<Database>);
        const orderService = new OrdersService(orderRepository, orderTagsRepository);
        return await orderService.updateOrderTags(orderId, tagIds);
    }
}