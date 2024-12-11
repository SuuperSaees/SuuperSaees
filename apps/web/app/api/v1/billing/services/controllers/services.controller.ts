import { NextRequest } from 'next/server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

// import { ApiError } from '~/lib/api/api-error';
import { BaseController } from '~/lib/api/base-controller';
import { Services as ServiceApi } from '~/lib/api/services.types';

import { createServiceService } from '../services/service.service';

export class ServiceController extends BaseController {
  async create(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const body = await this.parseBody<ServiceApi>(req);
      body.organizationId = this.getOrganizationId(req);

      const client = getSupabaseServerComponentClient({
        admin: true,
      });
      const serviceService = await createServiceService(client);
      const service = await serviceService.createService(body);

      return this.created(service, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async list(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();
    const organizationId = this.getOrganizationId(req);

    try {
      const client = getSupabaseServerComponentClient();
      const serviceService = await createServiceService(client);
      const services =
        await serviceService.listByOrganizationId(organizationId);
      return this.ok(services, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async get(
    _: undefined,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID();
    try {
      const client = getSupabaseServerComponentClient();
      const serviceService = await createServiceService(client);
      const service = await serviceService.findById(params.id);
      return this.ok(service, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async update(
    req: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID();
    const body = await this.parseBody<ServiceApi>(req);

    try {
      const client = getSupabaseServerComponentClient({
        admin: true,
      });
      const serviceService = await createServiceService(client);
      const service = await serviceService.updateService(params.id, body);
      return this.ok(service, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async delete(
    _: undefined,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID();
    try {
      const client = getSupabaseServerComponentClient({
        admin: true,
      });
      const serviceService = await createServiceService(client);
      await serviceService.deleteService(params.id);
      return this.ok({}, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  private getOrganizationId(req: NextRequest): string {
    const organizationId = req.nextUrl.searchParams.get('organizationId') ?? '';
    return organizationId;
  }
}