import { Invoice, InvoiceItem } from '~/lib/invoice.types';
import { BaseAction } from '../base-action';
import { InvoiceController } from './controllers/invoices.controller';
import { IInvoiceAction } from './invoices.interface';

interface PaginationConfig {
  pagination?: {
    cursor?: string | number;
    endCursor?: string | number;
    page?: number;
    offset?: number;
    limit?: number;
  };
  search?: {
    term?: string;
    fields?: string[];
  };
  filters?: {
    status?: string[];
    customer_id?: string[];
    organization_id?: string[];
    date_from?: string;
    date_to?: string;
  };
}

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

  async create(payload: Invoice.InsertWithRelations): Promise<Invoice.Type> {
    return await this.controller.create(payload);
  }

  async list(
    organizationId: string, 
    config?: PaginationConfig
  ): Promise<{
    data: Invoice.Response[];
    nextCursor: string | null;
    count: number | null;
    pagination: {
      limit: number;
      hasNextPage: boolean;
      totalPages: number | null;
      currentPage: number | null;
      isOffsetBased: boolean;
    };
  }> {
    return await this.controller.list(organizationId, config);
  }

  async get(invoiceId: string): Promise<Invoice.Relational> {
    return await this.controller.get(invoiceId);
  }

  async delete(invoiceId: string): Promise<void> {
    return await this.controller.delete(invoiceId);
  }

  async update(payload: Invoice.Update & {invoice_items?: InvoiceItem.Insert[]}): Promise<Invoice.Type> {
    return await this.controller.update(payload);
  }
}

export function createInvoiceAction(baseUrl: string) {
  return new InvoiceAction(baseUrl);
} 