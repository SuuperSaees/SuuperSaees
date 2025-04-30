import { NextRequest } from 'next/server';

import { ErrorBriefOperations } from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { ApiError } from '~/lib/api/api-error';
import { BaseController } from '~/lib/api/base-controller';

import { createBriefService } from '../services/brief.service';

export class BriefController extends BaseController {
  async list(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') ?? '10', 10);
      const offset = parseInt(searchParams.get('offset') ?? '0', 10);
      const organizationId = req.headers.get('organization_id') ?? undefined;
      const agencyId = req.headers.get('agency_id') ?? undefined;

      console.log('organizationId', organizationId);
      console.log('agencyId', agencyId);

      const client = getSupabaseServerComponentClient({ admin: true });
      const briefService = await createBriefService(client);

      const result = await briefService.listBriefs(limit, offset, organizationId, agencyId);
      return this.ok(result, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async get(
    _: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const briefId = params.id;

      if (!briefId) {
        throw ApiError.badRequest(
          'The id parameter is required',
          ErrorBriefOperations.FAILED_TO_GET_FORM_FIELDS,
        );
      }

      const client = getSupabaseServerComponentClient({ admin: true });
      const briefService = await createBriefService(client);

      const brief = await briefService.getBriefById(briefId);
      return this.ok(brief, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async create(): Promise<Response> {
    await Promise.resolve();

    const requestId = crypto.randomUUID();

    return this.handleError(new Error('Not implemented'), requestId);
  } 

  async update(): Promise<Response> {
    await Promise.resolve();

    const requestId = crypto.randomUUID();

    return this.handleError(new Error('Not implemented'), requestId);
  }

  async delete(): Promise<Response> {
    await Promise.resolve();

    const requestId = crypto.randomUUID();

    return this.handleError(new Error('Not implemented'), requestId);
  }
  
} 