import { NextRequest } from 'next/server';

import { ErrorOrderOperations } from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { ApiError } from '~/lib/api/api-error';
import { BaseController } from '~/lib/api/base-controller';

import { CreateOrderDTO } from '../dtos/order.dto';
import { createOrderService } from '../services/order.service';

export class OrderController extends BaseController {
  async create(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {

      const organizationId = req.headers.get('organization_id');
      const userId = req.headers.get('user_id');
      const agencyId = req.headers.get('agency_id');
      const role = req.headers.get('role');
      const domain = req.headers.get('domain');

      if (!organizationId || !userId || !agencyId || !role || !domain) {
        throw ApiError.badRequest(
          'Missing required headers',
          ErrorOrderOperations.FAILED_TO_CREATE_ORDER,
        );
      }

      const body = await this.parseBody<CreateOrderDTO>(req);

      if (!body.title) {
        throw ApiError.badRequest(
          'Title is required',
          ErrorOrderOperations.FAILED_TO_CREATE_ORDER,
        );
      }

      if (!body.brief_responses?.length) {
        throw ApiError.badRequest(
          'Brief responses are required',
          ErrorOrderOperations.FAILED_TO_CREATE_ORDER,
        );
      }

      const client = getSupabaseServerComponentClient({ admin: true });
      const orderService = await createOrderService(client);

      const order = await orderService.createOrder(body, organizationId, userId, agencyId, role, domain);
      return this.created(order, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async list(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const organizationId = req.headers.get('organization_id') ?? '';
      const agencyId = req.headers.get('agency_id') ?? '';

      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') ?? '10', 10);
      const offset = parseInt(searchParams.get('offset') ?? '0', 10);

      const client = getSupabaseServerComponentClient({ admin: true });
      const orderService = await createOrderService(client);

      const result = await orderService.listOrders(limit, offset, organizationId, agencyId);
      return this.ok(result, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async get(
    req: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const organizationId = req.headers.get('organization_id') ?? '';
      const agencyId = req.headers.get('agency_id') ?? '';
      const orderId = params.id;

      if (!orderId) {
        throw ApiError.badRequest(
          'The id parameter is required',
          ErrorOrderOperations.FAILED_TO_GET_ORDER,
        );
      }

      const client = getSupabaseServerComponentClient({ admin: true });
      const orderService = await createOrderService(client);

      const order = await orderService.getOrderById(orderId, organizationId, agencyId);
      return this.ok(order, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async update(): Promise<Response> {
     await Promise.resolve();

    const requestId = crypto.randomUUID();

    return this.ok({
      message: 'Order updated successfully',
    }, requestId);
  }

  async delete(): Promise<Response> {
    const requestId = crypto.randomUUID();

    await Promise.resolve();

    return this.ok({
      message: 'Order deleted successfully',
    }, requestId);
  }
} 