import { SupabaseClient } from '@supabase/supabase-js';

import { Logger as LoggerInstance, createLogger } from '@kit/shared/logger';
import { ErrorBriefOperations } from '@kit/shared/response';

import { ApiError } from '~/lib/api/api-error';
import { Database, Json } from '~/lib/database.types';

import { BriefRepository } from '../repositories/brief.repository';

export class BriefService {
  constructor(
    private readonly logger: LoggerInstance,
    private readonly briefRepository: BriefRepository,
  ) {}

  async listBriefs(limit: number, offset: number, organizationId?: string, agencyId?: string): Promise<{
    briefs: {
      id: string;
      name: string;
      description: string | null;
      created_at: string;
      image_url: string | null;
    }[];
    total: number;
    limit: number;
    offset: number;
  }> {
    try {
      const { briefs, total } = await this.briefRepository.getBriefs(limit, offset, organizationId, agencyId);
      
      // Filtrar solo la información necesaria para la API externa
      const filteredBriefs = briefs.map(brief => ({
        id: brief.id,
        name: brief.name,
        description: brief.description,
        created_at: brief.created_at,
        image_url: brief.image_url,
      }));

      return {
        briefs: filteredBriefs,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to list briefs');
      throw ApiError.internalError(
        ErrorBriefOperations.FAILED_TO_LIST_BRIEFS,
      );
    }
  }

  async getBriefById(briefId: string): Promise<{
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    image_url: string | null;
    form_fields: {
      id: string;
      type: string;
      description: string;
      position: number;
      required: boolean;
      options: Json[] | null;
      label: string;
      placeholder: string | null;
      alert_message: string | null;
    }[];
  }> {
    try {
      const brief = await this.briefRepository.getBriefById(briefId);
      
      if (!brief) {
        throw ApiError.notFound(
          'Brief not found',
          ErrorBriefOperations.FAILED_TO_GET_FORM_FIELDS,
        );
      }
    
      return {
        id: brief.id,
        name: brief.name,
        description: brief.description,
        created_at: brief.created_at,
        image_url: brief.image_url,
        form_fields: brief.form_fields.map(field => ({
          id: field?.id ?? '',
          type: field?.type ?? '',
          description: field?.description ?? '',
          position: field?.position ?? 0,
          required: field?.required ?? false,
          options: field?.options ?? [],
          label: field?.label ?? '',
          placeholder: field?.placeholder ?? '',
          alert_message: field?.alert_message ?? '',
        })),
      };
    } catch (error) {
      this.logger.error({ error, briefId }, 'Failed to get brief');
      
      throw error instanceof ApiError
        ? error
        : ApiError.internalError(
            'FAILED_TO_GET_BRIEF',
          );
    }
  }
}

export const createBriefService = async (
  client: SupabaseClient<Database>,
): Promise<BriefService> => {
  const logger = await createLogger();
  const briefRepository = new BriefRepository(client);
  return new BriefService(logger, briefRepository);
}; 