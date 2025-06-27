import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { InvoiceRepository } from '../repositories/invoices.repository';
import { InvoiceItemsRepository } from '../repositories/invoice-items.repository';
import { InvoiceService } from '../services/invoices.service';
import { Invoice } from '~/lib/invoice.types';
import { Pagination } from '~/lib/pagination';
import { createQueryContext, PaginationConfig } from '../../query.config';

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
  async create(payload: Invoice.Request.Create): Promise<Invoice.Type> {
    try {
      const invoiceRepository = new InvoiceRepository(this.client, undefined);
      const invoiceItemsRepository = new InvoiceItemsRepository(this.client, undefined);
      const invoiceService = new InvoiceService(invoiceRepository, invoiceItemsRepository);
      return await invoiceService.create(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async list(
    config?: PaginationConfig
  ): Promise<Pagination.Response<Invoice.Response>> {
    try {
      // Create context with config
      const queryContext = createQueryContext(config);
      
      // Inject context into repository
      const invoiceRepository = new InvoiceRepository(this.client, undefined, queryContext);
      const invoiceService = new InvoiceService(invoiceRepository);
      
      return await invoiceService.list();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async get(invoiceId: string): Promise<Invoice.Response> {
    try {
      const invoiceRepository = new InvoiceRepository(this.client, undefined);
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
      const invoiceRepository = new InvoiceRepository(this.client, undefined);
      const invoiceItemsRepository = new InvoiceItemsRepository(this.client, undefined);
      const invoiceService = new InvoiceService(invoiceRepository, invoiceItemsRepository);
      return await invoiceService.delete(invoiceId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async update(payload: Invoice.Request.Update): Promise<Invoice.Type> {
    try {
      const invoiceRepository = new InvoiceRepository(this.client, undefined);
      const invoiceItemsRepository = new InvoiceItemsRepository(this.client, undefined);
      const invoiceService = new InvoiceService(invoiceRepository, invoiceItemsRepository);
      return await invoiceService.update(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}