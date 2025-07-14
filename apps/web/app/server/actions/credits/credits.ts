import { Credit } from '~/lib/credit.types';
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

  async update(payload: Credit.Request.Update): Promise<Credit.Type> {
    return await this.controller.update(payload);
  }

  async delete(creditId: string): Promise<void> {
    return await this.controller.delete(creditId);
  }
}

export function createCreditAction(baseUrl: string) {
  return new CreditAction(baseUrl);
}
