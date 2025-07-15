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

  async get(clientOrganizationId?: string): Promise<Credit.Response> {
    return await this.controller.get(clientOrganizationId);
  }

  async list(config?: PaginationConfig): Promise<Pagination.Response<CreditOperations.Response>> {
    return await this.controller.list(config);
  }

  async createOperation(payload: Credit.Request.Create): Promise<Credit.Type> {
    return await this.controller.createOperation(payload);
  }

  async updateOperation(payload: Credit.Request.Update): Promise<Credit.Type> {
    return await this.controller.updateOperation(payload);
  }

  async removeOperation(payload: Credit.Request.Remove): Promise<Credit.Type> {
    return await this.controller.removeOperation(payload);
  }
}

export function createCreditAction(baseUrl: string) {
  return new CreditAction(baseUrl);
}
