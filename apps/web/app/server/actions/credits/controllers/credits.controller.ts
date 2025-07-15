import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Credit } from '~/lib/credit.types';
import { Pagination } from '~/lib/pagination';
import { PaginationConfig, createQueryContext } from '../../query.config';
import { CreditRepository } from '../repositories/credits.repository';
import { CreditOperationRepository } from '../repositories/credit-operations.repository';
import { CreditService } from '../services/credits.service';

export class CreditController {
  private baseUrl: string;
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;

  constructor(
    baseUrl: string,
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>
  ) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.adminClient = adminClient;
  }

  // * GET CONTROLLERS
  async get(clientOrganizationId?: string): Promise<Credit.Response> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.get(clientOrganizationId);
    } catch (error) {
      console.error('Error in CreditController.get:', error);
      throw error;
    }
  }

  async listByOrganization(organizationId?: string, config?: PaginationConfig): Promise<Pagination.Response<Credit.Response>> {
    try {
      const queryContext = createQueryContext(config);
      const creditRepository = new CreditRepository(this.client, this.adminClient, queryContext);
      const creditService = new CreditService(creditRepository);
      
      const repositoryResponse = await creditService.listByOrganization(organizationId);
      
      return {
        data: repositoryResponse.data,
        total: repositoryResponse.count,
        limit: repositoryResponse.pagination.limit,
        page: repositoryResponse.pagination.currentPage,
        nextCursor: repositoryResponse.nextCursor,
        prevCursor: null,
      };
    } catch (error) {
      console.error('Error in CreditController.listByOrganization:', error);
      throw error;
    }
  }

  // * OPERATION CONTROLLERS (Indirect credit modifications)
  async createOperation(payload: Credit.Request.Create): Promise<Credit.Type> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditOperationRepository = new CreditOperationRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository, creditOperationRepository);
      
      return await creditService.createOperation(payload);
    } catch (error) {
      console.error('Error in CreditController.createOperation:', error);
      throw error;
    }
  }

  async updateOperation(payload: Credit.Request.Update): Promise<Credit.Type> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditOperationRepository = new CreditOperationRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository, creditOperationRepository);
      
      return await creditService.updateOperation(payload);
    } catch (error) {
      console.error('Error in CreditController.updateOperation:', error);
      throw error;
    }
  }

  async deleteOperation(creditId: string, actorId: string, creditOperationId?: string): Promise<void> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditOperationRepository = new CreditOperationRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository, creditOperationRepository);
      
      return await creditService.deleteOperation(creditId, actorId, creditOperationId);
    } catch (error) {
      console.error('Error in CreditController.deleteOperation:', error);
      throw error;
    }
  }
}
