import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { InvoiceRepository } from '../repositories/invoices.repository';
import { InvoiceItemsRepository } from '../repositories/invoice-items.repository';
import { InvoiceService } from '../services/invoices.service';
import { Invoice, InvoiceItem } from '~/lib/invoice.types';

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

export class InvoiceController {
  private baseUrl: string;
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;

  constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE CONTROLLERS
  async create(payload: Invoice.InsertWithRelations): Promise<Invoice.Type> {
    try {
      const invoiceRepository = new InvoiceRepository(this.client, this.adminClient);
      const invoiceItemsRepository = new InvoiceItemsRepository(this.client, this.adminClient);
      const invoiceService = new InvoiceService(invoiceRepository, invoiceItemsRepository);
      return await invoiceService.create(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
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
    try {
      const invoiceRepository = new InvoiceRepository(this.client, this.adminClient);
      const invoiceService = new InvoiceService(invoiceRepository);
      return await invoiceService.list(organizationId, config);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async get(invoiceId: string): Promise<Invoice.Relational> {
    try {
      const invoiceRepository = new InvoiceRepository(this.client, this.adminClient);
      const invoiceService = new InvoiceService(invoiceRepository);
      return await invoiceService.get(invoiceId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * DELETE CONTROLLERS
  async delete(invoiceId: string): Promise<void> {
    try {
      const invoiceRepository = new InvoiceRepository(this.client, this.adminClient);
      const invoiceItemsRepository = new InvoiceItemsRepository(this.client, this.adminClient);
      const invoiceService = new InvoiceService(invoiceRepository, invoiceItemsRepository);
      return await invoiceService.delete(invoiceId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async update(payload: Invoice.Update & {invoice_items?: InvoiceItem.Insert[]}): Promise<Invoice.Type> {
    try {
      const invoiceRepository = new InvoiceRepository(this.client, this.adminClient);
      const invoiceItemsRepository = new InvoiceItemsRepository(this.client, this.adminClient);
      const invoiceService = new InvoiceService(invoiceRepository, invoiceItemsRepository);
      return await invoiceService.update(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
} 