import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { InvoicePaymentRepository } from '../repositories/invoice-payments.repository';
import { InvoicePaymentService } from '../services/invoice-payments.service';
import { InvoicePayment } from '~/lib/invoice-payment.types';

export class InvoicePaymentController {
  private baseUrl: string;
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;

  constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE CONTROLLERS
  async create(payload: InvoicePayment.Request.Create): Promise<InvoicePayment.Type> {
    try {
      const repository = new InvoicePaymentRepository(this.client, this.adminClient);
      const service = new InvoicePaymentService(repository);
      return await service.create(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async getByInvoiceId(invoiceId: string): Promise<InvoicePayment.Response[]> {
    try {
      const repository = new InvoicePaymentRepository(this.client, this.adminClient);
      const service = new InvoicePaymentService(repository);
      return await service.getByInvoiceId(invoiceId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async get(paymentId: string): Promise<InvoicePayment.Response> {
    try {
      const repository = new InvoicePaymentRepository(this.client, this.adminClient);
      const service = new InvoicePaymentService(repository);
      return await service.get(paymentId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async update(payload: InvoicePayment.Request.Update): Promise<InvoicePayment.Type> {
    try {
      const repository = new InvoicePaymentRepository(this.client, this.adminClient);
      const service = new InvoicePaymentService(repository);
      return await service.update(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * DELETE CONTROLLERS
  async delete(paymentId: string): Promise<void> {
    try {
      const repository = new InvoicePaymentRepository(this.client, this.adminClient);
      const service = new InvoicePaymentService(repository);
      return await service.delete(paymentId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * BUSINESS LOGIC CONTROLLERS
  async processManualPayment(
    invoiceId: string,
    paymentData: {
      amount: number;
      currency: string;
      paymentMethod: string;
      notes?: string;
      referenceNumber?: string;
    }
  ): Promise<InvoicePayment.Type> {
    try {
      const repository = new InvoicePaymentRepository(this.client, this.adminClient);
      const service = new InvoicePaymentService(repository);
      return await service.processManualPayment(invoiceId, paymentData);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}