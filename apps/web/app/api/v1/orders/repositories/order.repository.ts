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
    organizationId: string,
    userId: string,
    agencyId: string,
    role: string,
    domain: string,
  ): Promise<Order.Type> {
    console.log('agencyId', agencyId);
    console.log('domain', domain);
    const { data, error } = await this.client.rpc(
      'create_order',
      {
        _order: order,
        _brief_responses: briefResponses,
        _order_followers: orderFollowers,
        _order_file_ids: [],
        _organization_id: organizationId,
        _user_id: userId,
        _user_role: role,
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

  async getOrders(limit: number, offset: number, organizationId: string, agencyId: string): Promise<{
    orders: Pick<Order.Type, 'id' | 'uuid' | 'title' | 'description' | 'customer_id' | 'priority' | 'due_date' | 'created_at' | 'brief_id' | 'status' | 'client_organization_id'>[];
    total: number;
  }> {
    // Obtener órdenes con paginación
    const { data: orders, error } = await this.client
      .from('orders_v2')
      .select(`
        id, uuid, title, description, customer_id, 
        priority, due_date, created_at, brief_id, 
        status, client_organization_id
      `)
      .eq('client_organization_id', organizationId)
      .eq('agency_id', agencyId)
      .range(offset, offset + limit - 1);

    if (error) {
      console.log('error', error);
      throw new Error(`Error fetching orders: ${error.message}`);
    }

    // Obtener el total de órdenes
    const { count, error: countError } = await this.client
      .from('orders_v2')
      .select('*', { count: 'exact', head: true })
      .eq('client_organization_id', organizationId)
      .eq('agency_id', agencyId);

    if (countError) {
      throw new Error(`Error counting orders: ${countError.message}`);
    }

    return {
      orders: orders as unknown as Pick<Order.Type, 'id' | 'uuid' | 'title' | 'description' | 'customer_id' | 'priority' | 'due_date' | 'created_at' | 'brief_id' | 'status' | 'client_organization_id'>[],
      total: count ?? 0,
    };
  }

  async getOrderById(orderId: string, organizationId: string, agencyId: string): Promise<Pick<Order.Type, 'id' | 'uuid' | 'title' | 'description' | 'customer_id' | 'priority' | 'due_date' | 'created_at' | 'brief_id' | 'status' | 'client_organization_id' | 'visibility'> | null> {
    const { data, error } = await this.client
      .from('orders_v2')
      .select(`
        id, uuid, title, description, customer_id, 
        priority, due_date, created_at, brief_id, 
        status, client_organization_id, visibility
      `)
      .eq('id', orderId)
      .eq('client_organization_id', organizationId)
      .eq('agency_id', agencyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching order: ${error.message}`);
    }

    return data as unknown as Pick<Order.Type, 'id' | 'uuid' | 'title' | 'description' | 'customer_id' | 'priority' | 'due_date' | 'created_at' | 'brief_id' | 'status' | 'client_organization_id' | 'visibility'>;
  }
} 