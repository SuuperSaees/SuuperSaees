import { Invoice } from '~/lib/invoice.types';
import { Pagination } from '~/lib/pagination';
import { BaseAction } from '../base-action';
import { InvoiceController } from './controllers/invoices.controller';
import { IInvoiceAction } from './invoices.interface';
import { PaginationConfig } from '../query.config';

export class InvoiceAction extends BaseAction implements IInvoiceAction {
  private controller: InvoiceController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new InvoiceController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async create(payload: Invoice.Request.Create): Promise<Invoice.Type> {
    return await this.controller.create(payload);
  }

  async list(
    config?: PaginationConfig
  ): Promise<Pagination.Response<Invoice.Response>> {
    return await this.controller.list(config);
  }

  async get(invoiceId: string): Promise<Invoice.Response> {
    return await this.controller.get(invoiceId);
  }

  async delete(invoiceId: string): Promise<void> {
    return await this.controller.delete(invoiceId);
  }

  async update(payload: Invoice.Request.Update): Promise<Invoice.Type> {
    return await this.controller.update(payload);
  }
}

export function createInvoiceAction(baseUrl: string) {
  return new InvoiceAction(baseUrl);
} 