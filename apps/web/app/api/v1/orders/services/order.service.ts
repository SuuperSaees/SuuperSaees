import { SupabaseClient } from '@supabase/supabase-js';

import { Logger as LoggerInstance, createLogger } from '@kit/shared/logger';
import { ErrorOrderOperations } from '@kit/shared/response';

import { Order } from '~/lib/order.types';
import { ApiError } from '~/lib/api/api-error';
import { Database } from '~/lib/database.types';
import { textFormat } from '~/utils/text-format';

import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDTO } from '../dtos/order.dto';

export class OrderService {
  constructor(
    private readonly logger: LoggerInstance,
    private readonly orderRepository: OrderRepository,
  ) {}

  async createOrder(
    data: CreateOrderDTO,
    organizationId: string,
    userId: string,
    agencyId: string,
    role: string,
    domain: string,
  ): Promise<Pick<Order.Type, 'id' | 'uuid' | 'title' | 'description' | 'customer_id' | 'priority' | 'due_date' | 'created_at' | 'brief_id' | 'status' | 'client_organization_id' | 'visibility'>> {
    try {
      this.logger.info({ title: data.title }, 'Creating order');

      // Prepare the order data
      const briefIds = data.brief_responses?.map((response) => response.brief_id) ?? [];
      
      const orderToInsert = {
        uuid: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        priority: data.priority,
        due_date: data.due_date,
        brief_ids: briefIds,
      };
      
      // Process brief responses if they exist
      const processedBriefResponses = data.brief_responses?.map(response => ({
        ...response,
        form_fields: response.form_fields.map(field => ({
          ...field,
          response: typeof field.response === 'string'
            ? textFormat.encode(field.response)
            : field.response
        }))
      }));


      // Create the order using the RPC function
      const order = await this.orderRepository.createOrder(
        orderToInsert,
        processedBriefResponses ? processedBriefResponses.flatMap(response => 
          response.form_fields.map(field => ({
            brief_id: response.brief_id,
            form_field_id: field.form_field_id,
            response: field.response,
            order_id: orderToInsert.uuid // This will be filled by the repository
          }))
        ) : [],
        [],
        organizationId,
        userId,
        agencyId,
        role,
        domain,
      );

      this.logger.info(
        { id: order.id },
        'Order created successfully',
      );

      return {
        id: order.id,
        uuid: order.uuid,
        title: order.title,
        description: order.description,
        customer_id: order.customer_id,
        priority: order.priority,
        due_date: order.due_date,
        created_at: order.created_at,
        brief_id: order.brief_id,
        status: order.status,
        client_organization_id: order.client_organization_id,
        visibility: order.visibility,
      };
    } catch (error) {
      this.logger.error({ error, data }, 'Failed to create order');
      throw error instanceof ApiError
        ? error
        : ApiError.internalError(
            ErrorOrderOperations.FAILED_TO_CREATE_ORDER,
          );
    }
  }

  async listOrders(limit: number, offset: number, organizationId: string, agencyId: string): Promise<{
    orders: Array<{
      id: number;
      title: string;
      status: string;
      priority: "low" | "medium" | "high";
      created_at: string;
      description: string | null;
      due_date: string | null;
      brief_id: string | null;
      client_organization_id: string;
      customer_id: string;
      uuid: string;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    try {
      const { orders, total } = await this.orderRepository.getOrders(limit, offset, organizationId, agencyId);
      
      const filteredOrders = orders.map(order => ({
        ...order,
        status: order.status ?? 'pending',
        priority: order.priority ?? 'low'
      }));

      return { orders: filteredOrders, total, limit, offset };
    } catch (error) {
      throw ApiError.internalError(
        ErrorOrderOperations.FAILED_TO_LIST_ORDERS,
      );
    }
  }

  async getOrderById(orderId: string, organizationId: string, agencyId: string): Promise<{
    id: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    due_date: string | null;
    created_at: string;
    client_organization_id: string;
    customer_id: string;
    uuid: string;
    brief_id: string | null;
    visibility: string;
  }> {
    try {
      const order = await this.orderRepository.getOrderById(orderId, organizationId, agencyId);
      
      if (!order) {
        throw ApiError.notFound(
          `Order with ID ${orderId} not found`,
          ErrorOrderOperations.ORDER_NOT_FOUND,
        );
      }
      
      // Devolver solo la información necesaria
      return {
        ...order,
        status: order.status ?? 'pending',
        priority: order.priority ?? 'low',
        visibility: order.visibility ?? 'public'
      };
    } catch (error) {
      this.logger.error({ error, orderId }, 'Failed to get order');
      
      throw error instanceof ApiError
        ? error
        : ApiError.internalError(
            ErrorOrderOperations.FAILED_TO_GET_ORDER,
          );
    }
  }
}

export const createOrderService = async (
  client: SupabaseClient<Database>,
): Promise<OrderService> => {
  const logger = await createLogger();
  const orderRepository = new OrderRepository(client);
  return new OrderService(logger, orderRepository);
}; 