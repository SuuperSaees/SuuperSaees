import { Credit, CreditOperations } from '~/lib/credit.types';
import { Pagination } from '~/lib/pagination';
import { BaseAction } from '../base-action';
import { CreditController } from './controllers/credits.controller';
import { ICreditAction } from './credits.interface';
import { PaginationConfig } from '../query.config';

export class CreditAction extends BaseAction implements ICreditAction {
  private controller: CreditController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new CreditController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async create(payload: Credit.Request.Create): Promise<Credit.Type> {
    return await this.controller.create(payload);
  }

  async list(config?: PaginationConfig): Promise<Pagination.Response<Credit.Response>> {
    return await this.controller.list(config);
  }

  async get(creditId: string): Promise<Credit.Response> {
    return await this.controller.get(creditId);
  }

  async getByClientOrganization(clientOrganizationId: string): Promise<Credit.Response[]> {
    return await this.controller.getByClientOrganization(clientOrganizationId);
  }

  async getByAgency(agencyId: string): Promise<Credit.Response[]> {
    return await this.controller.getByAgency(agencyId);
  }

  async update(payload: Credit.Request.Update): Promise<Credit.Type> {
    return await this.controller.update(payload);
  }

  async delete(creditId: string): Promise<void> {
    return await this.controller.delete(creditId);
  }

  async addCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type> {
    return await this.controller.addCredits(creditId, operationData);
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
    return await this.controller.consumeCredits(creditId, operationData);
  }

  async getBalance(creditId: string): Promise<number> {
    return await this.controller.getBalance(creditId);
  }

  async transferCredits(transferData: {
    fromCreditId: string;
    toCreditId: string;
    quantity: number;
    description?: string;
    actorId: string;
    metadata?: any;
  }): Promise<CreditOperations.Type[]> {
    return await this.controller.transferCredits(transferData);
  }

  // * ADDITIONAL BUSINESS LOGIC METHODS
  async refundCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type> {
    return await this.controller.refundCredits(creditId, operationData);
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
    return await this.controller.lockCredits(creditId, operationData);
  }

  // * UTILITY METHODS
  async getCreditHistory(
    creditId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CreditOperations.Response[]> {
    return await this.controller.getCreditHistory(creditId, startDate, endDate);
  }

  async getCreditSummary(creditId: string): Promise<{
    currentBalance: number;
    totalPurchased: number;
    totalConsumed: number;
    totalRefunded: number;
    totalLocked: number;
    totalExpired: number;
  }> {
    return await this.controller.getCreditSummary(creditId);
  }
}

export function createCreditAction(baseUrl: string) {
  return new CreditAction(baseUrl);
}
