import { SupabaseClient } from '@supabase/supabase-js';



import { Logger as LoggerInstance, createLogger } from '@kit/shared/logger';



import { ApiError } from '~/lib/api/api-error';
import { BillingAccounts } from '~/lib/billing-accounts.types';
import { Database } from '~/lib/database.types';



import { CreateServiceDTO, UpdateServiceDTO } from '../dtos/service.dto';
import { BillingServiceRepository } from '../repositories/billing-service.repository';
import { ServiceRepository } from '../repositories/service.repository';


export class ServiceService {
  constructor(
    private readonly logger: LoggerInstance,
    private readonly serviceRepository: ServiceRepository,
    private readonly billingServiceRepository: BillingServiceRepository,
  ) {}

  async createService(data: CreateServiceDTO) {
    try {
      this.logger.info({ serviceName: data.name }, 'Creating service');
      let service;
      if (data.provider !== BillingAccounts.BillingProviderKeys.SUUPER) {
        await this.billingServiceRepository.create({
          service_id: data.id ?? 0,
          provider: data.provider,
          provider_id: data.provider_id ?? '',
          status: data.status,
        });
      } else {
        service = await this.serviceRepository.create(data);
      }

      this.logger.info(
        { serviceName: data.name },
        'Service created successfully',
      );
      return service;
    } catch (error) {
      this.logger.error({ error, data }, 'Failed to create service');
      throw error instanceof ApiError ? error : ApiError.internalError();
    }
  }

  async listByOrganizationId(organizationId: string) {
    try {
      const services =
        await this.serviceRepository.listByOrganizationId(organizationId);
      this.logger.info({ organizationId }, 'Services found successfully');
      return services;
    } catch (error) {
      this.logger.error({ error, organizationId }, 'Failed to list services');
      throw error instanceof ApiError ? error : ApiError.internalError();
    }
  }

  async findById(id: string) {
    try {
      const service = await this.serviceRepository.findById(id);
      this.logger.info({ id }, 'Service found successfully');
      return service;
    } catch (error) {
      this.logger.error({ error, id }, 'Failed to find service');
      throw error instanceof ApiError ? error : ApiError.internalError();
    }
  }

  async deleteService(id: string) {
    try {
      await this.serviceRepository.softDelete(id);
      await this.billingServiceRepository.softDeleteByServiceId(id);
    } catch (error) {
      this.logger.error({ error, id }, 'Failed to delete service');
      throw error instanceof ApiError ? error : ApiError.internalError();
    }
  }

  async updateService(id: string, data: UpdateServiceDTO) {
    try {
      let service;
      if (data.provider !== BillingAccounts.BillingProviderKeys.SUUPER) {
        await this.billingServiceRepository.update(id, {
          status: data.status,
        });

        service = await this.billingServiceRepository.findByServiceId(
          data.id ?? 0,
        );
      } else {
        service = await this.serviceRepository.update(data.id ?? 0, data);
      }
      return service;
    } catch (error) {
      this.logger.error({ error, id, data }, 'Failed to update service');
      throw error instanceof ApiError ? error : ApiError.internalError();
    }
  }
}

export const createServiceService = async (
  client: SupabaseClient<Database>,
) => {
  const logger = await createLogger();
  const serviceRepository = new ServiceRepository(client);
  const billingServiceRepository = new BillingServiceRepository(client);
  return new ServiceService(
    logger,
    serviceRepository,
    billingServiceRepository,
  );
};