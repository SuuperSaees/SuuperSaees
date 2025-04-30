import { SupabaseClient } from '@supabase/supabase-js';

import { ApiError } from '~/lib/api/api-error';
import { Database } from '~/lib/database.types';
import { Order } from '~/lib/order.types';
import { Brief } from '~/lib/brief.types';
import { ErrorOrderOperations } from '@kit/shared/response';

export class OrderRepository {
  constructor(private client: SupabaseClient<Database>) {}

  async createOrder(
    order: Partial<Order.Insert>,
    briefResponses: Brief.Relationships.FormFieldResponses[],
    orderFollowers: string[],
  ): Promise<Order.Type> {
    const { data, error } = await this.client.rpc(
      'create_order',
      {
        _order: order,
        _brief_responses: briefResponses,
        _order_followers: orderFollowers,
        _order_file_ids: [],
      },
    );

    if (error) {
      if (error.code === '42501') {
        throw ApiError.unauthorized(
          ErrorOrderOperations.INSUFFICIENT_PERMISSIONS,
        );
      } else {
        throw ApiError.internalError(
          ErrorOrderOperations.FAILED_TO_CREATE_ORDER,
        );
      }
    }

    return data as Order.Type;
  }

  async getOrders(limit: number, offset: number): Promise<{
    orders: Order.Type[];
    total: number;
  }> {
    // Obtener órdenes con paginación
    const { data: orders, error } = await this.client
      .from('orders')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }

    // Obtener el total de órdenes
    const { count, error: countError } = await this.client
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Error counting orders: ${countError.message}`);
    }

    return {
      orders: orders as Order.Type[],
      total: count ?? 0,
    };
  }

  async getOrderById(orderId: string): Promise<Order.Type | null> {
    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching order: ${error.message}`);
    }

    return data as Order.Type;
  }
} 