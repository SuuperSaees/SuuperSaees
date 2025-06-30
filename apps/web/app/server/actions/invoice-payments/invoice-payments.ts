import { InvoicePayment } from '~/lib/invoice-payment.types';
import { BaseAction } from '../base-action';
import { InvoicePaymentController } from './controllers/invoice-payments.controller';
import { IInvoicePaymentAction } from './invoice-payments.interface';

export class InvoicePaymentAction extends BaseAction implements IInvoicePaymentAction {
  private controller: InvoicePaymentController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new InvoicePaymentController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async create(payload: InvoicePayment.Request.Create): Promise<InvoicePayment.Type> {
    return await this.controller.create(payload);
  }

  async getByInvoiceId(invoiceId: string): Promise<InvoicePayment.Response[]> {
    return await this.controller.getByInvoiceId(invoiceId);
  }

  async get(paymentId: string): Promise<InvoicePayment.Response> {
    return await this.controller.get(paymentId);
  }

  async update(payload: InvoicePayment.Request.Update): Promise<InvoicePayment.Type> {
    return await this.controller.update(payload);
  }

  async delete(paymentId: string): Promise<void> {
    return await this.controller.delete(paymentId);
  }

  async processManualPayment(
    invoiceId: string,
    paymentData: {
      amount: number;
      paymentMethod: string;
      notes?: string;
      referenceNumber?: string;
    }
  ): Promise<InvoicePayment.Type> {
    return await this.controller.processManualPayment(invoiceId, paymentData);
  }
}

export function createInvoicePaymentAction(baseUrl: string) {
  return new InvoicePaymentAction(baseUrl);
}