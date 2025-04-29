import { SupabaseClient } from '@supabase/supabase-js';

import { Logger as LoggerInstance, createLogger } from '@kit/shared/logger';
import { ErrorBriefOperations } from '@kit/shared/response';

import { ApiError } from '~/lib/api/api-error';
import { Database } from '~/lib/database.types';

import { BriefRepository } from '../repositories/brief.repository';

export class BriefService {
  constructor(
    private readonly logger: LoggerInstance,
    private readonly briefRepository: BriefRepository,
  ) {}

  async listBriefs(limit: number, offset: number, organizationId?: string): Promise<{
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
      const { briefs, total } = await this.briefRepository.getBriefs(limit, offset, organizationId);
      
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
}

export const createBriefService = async (
  client: SupabaseClient<Database>,
): Promise<BriefService> => {
  const logger = await createLogger();
  const briefRepository = new BriefRepository(client);
  return new BriefService(logger, briefRepository);
}; 