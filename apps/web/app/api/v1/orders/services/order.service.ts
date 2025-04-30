import { SupabaseClient } from '@supabase/supabase-js';

import { Logger as LoggerInstance, createLogger } from '@kit/shared/logger';
import { CustomResponse, ErrorOrderOperations } from '@kit/shared/response';

import { Order } from '~/lib/order.types';
import { ApiError } from '~/lib/api/api-error';
import { Database } from '~/lib/database.types';
import { Brief } from '~/lib/brief.types';
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
  ): Promise<Order.Type> {
    try {
      this.logger.info({ title: data.title }, 'Creating order');

      // Prepare the order data
      const briefIds = data.brief_responses?.map((response) => response.brief_id) ?? [];
      
      const orderToInsert = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        due_date: data.due_date,
        brief_ids: briefIds,
      };
      
      // Process brief responses if they exist
      const processedBriefResponses = data.brief_responses?.map(response => ({
        ...response,
        response: typeof response.response === 'string' 
          ? textFormat.encode(response.response) 
          : response.response
      }));

      // Create the order using the RPC function
      const order = await this.orderRepository.createOrder(
        orderToInsert,
        processedBriefResponses ?? [],
        data.order_followers ?? [],
      );

      this.logger.info(
        { id: order.id },
        'Order created successfully',
      );

      return order;
    } catch (error) {
      this.logger.error({ error, data }, 'Failed to create order');
      throw error instanceof ApiError
        ? error
        : ApiError.internalError(
            ErrorOrderOperations.FAILED_TO_CREATE_ORDER,
          );
    }
  }

  async listOrders(limit: number, offset: number): Promise<{
    orders: {
      id: string;
      title: string;
      status: string;
      priority: string;
      created_at: string;
    }[];
    total: number;
    limit: number;
    offset: number;
  }> {
    try {
      const { orders, total } = await this.orderRepository.getOrders(limit, offset);
      
      // Filtrar solo la información necesaria para la API externa
      const filteredOrders = orders.map(order => ({
        id: order.id,
        title: order.title,
        status: order.status,
        priority: order.priority,
        created_at: order.created_at,
      }));

      return {
        orders: filteredOrders,
        total,
        limit,
        offset,
      };
    } catch (error) {
      throw ApiError.internalError(
        ErrorOrderOperations.FAILED_TO_LIST_ORDERS,
      );
    }
  }

  async getOrderById(orderId: string): Promise<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    due_date: string | null;
    created_at: string;
  }> {
    try {
      const order = await this.orderRepository.getOrderById(orderId);
      
      if (!order) {
        throw ApiError.notFound(
          `Order with ID ${orderId} not found`,
          ErrorOrderOperations.ORDER_NOT_FOUND,
        );
      }
      
      // Devolver solo la información necesaria
      return {
        id: order.id,
        title: order.title,
        description: order.description,
        status: order.status,
        priority: order.priority,
        due_date: order.due_date,
        created_at: order.created_at,
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