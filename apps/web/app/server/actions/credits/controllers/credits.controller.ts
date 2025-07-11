import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Credit, CreditOperations } from '~/lib/credit.types';
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

  // * CREATE CONTROLLERS
  async create(payload: Credit.Request.Create): Promise<Credit.Type> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditOperationRepository = new CreditOperationRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository, creditOperationRepository);
      
      return await creditService.create(payload);
    } catch (error) {
      console.error('Error in CreditController.create:', error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async list(config?: PaginationConfig): Promise<Pagination.Response<Credit.Response>> {
    try {
      // Create context with config
      const queryContext = createQueryContext(config);
      
      // Inject context into repository
      const creditRepository = new CreditRepository(this.client, this.adminClient, queryContext);
      const creditService = new CreditService(creditRepository);
      
      const repositoryResponse = await creditService.list();
      
      // Transform repository response to match frontend Pagination.Response structure
      return {
        data: repositoryResponse.data,
        total: repositoryResponse.count,
        limit: repositoryResponse.pagination.limit,
        page: repositoryResponse.pagination.currentPage,
        nextCursor: repositoryResponse.nextCursor,
        prevCursor: null,
      };
    } catch (error) {
      console.error('Error in CreditController.list:', error);
      throw error;
    }
  }

  async get(creditId: string): Promise<Credit.Response> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.get(creditId);
    } catch (error) {
      console.error('Error in CreditController.get:', error);
      throw error;
    }
  }

  async getByClientOrganization(clientOrganizationId: string): Promise<Credit.Response[]> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.getByClientOrganization(clientOrganizationId);
    } catch (error) {
      console.error('Error in CreditController.getByClientOrganization:', error);
      throw error;
    }
  }

  async getByAgency(agencyId: string): Promise<Credit.Response[]> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.getByAgency(agencyId);
    } catch (error) {
      console.error('Error in CreditController.getByAgency:', error);
      throw error;
    }
  }

  async getBalance(creditId: string): Promise<number> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.getBalance(creditId);
    } catch (error) {
      console.error('Error in CreditController.getBalance:', error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async update(payload: Credit.Request.Update): Promise<Credit.Type> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditOperationRepository = new CreditOperationRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository, creditOperationRepository);
      
      return await creditService.update(payload);
    } catch (error) {
      console.error('Error in CreditController.update:', error);
      throw error;
    }
  }

  // * DELETE CONTROLLERS
  async delete(creditId: string): Promise<void> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.delete(creditId);
    } catch (error) {
      console.error('Error in CreditController.delete:', error);
      throw error;
    }
  }

  // * BUSINESS LOGIC CONTROLLERS
  async addCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.addCredits(creditId, operationData);
    } catch (error) {
      console.error('Error in CreditController.addCredits:', error);
      throw error;
    }
  }

  async consumeCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.consumeCredits(creditId, operationData);
    } catch (error) {
      console.error('Error in CreditController.consumeCredits:', error);
      throw error;
    }
  }

  async refundCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.refundCredits(creditId, operationData);
    } catch (error) {
      console.error('Error in CreditController.refundCredits:', error);
      throw error;
    }
  }

  async lockCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.lockCredits(creditId, operationData);
    } catch (error) {
      console.error('Error in CreditController.lockCredits:', error);
      throw error;
    }
  }

  async transferCredits(transferData: {
    fromCreditId: string;
    toCreditId: string;
    quantity: number;
    description?: string;
    actorId: string;
    metadata?: any;
  }): Promise<CreditOperations.Type[]> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository);
      
      return await creditService.transferCredits(transferData);
    } catch (error) {
      console.error('Error in CreditController.transferCredits:', error);
      throw error;
    }
  }

  // * UTILITY CONTROLLERS
  async getCreditHistory(
    creditId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CreditOperations.Response[]> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditOperationRepository = new CreditOperationRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository, creditOperationRepository);
      
      return await creditService.getCreditHistory(creditId, startDate, endDate);
    } catch (error) {
      console.error('Error in CreditController.getCreditHistory:', error);
      throw error;
    }
  }

  async getCreditSummary(creditId: string): Promise<{
    currentBalance: number;
    totalPurchased: number;
    totalConsumed: number;
    totalRefunded: number;
    totalLocked: number;
    totalExpired: number;
  }> {
    try {
      const creditRepository = new CreditRepository(this.client, this.adminClient);
      const creditOperationRepository = new CreditOperationRepository(this.client, this.adminClient);
      const creditService = new CreditService(creditRepository, creditOperationRepository);
      
      return await creditService.getCreditSummary(creditId);
    } catch (error) {
      console.error('Error in CreditController.getCreditSummary:', error);
      throw error;
    }
  }
}
