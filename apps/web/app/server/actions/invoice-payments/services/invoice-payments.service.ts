import { InvoicePaymentRepository } from '../repositories/invoice-payments.repository';
import { InvoicePayment } from '~/lib/invoice-payment.types';

export class InvoicePaymentService {
  constructor(
    private readonly invoicePaymentRepository: InvoicePaymentRepository
  ) {}

  // * CREATE SERVICES
  async create(payload: InvoicePayment.Request.Create): Promise<InvoicePayment.Type> {
    return await this.invoicePaymentRepository.create(payload);
  }

  // * GET SERVICES
  async getByInvoiceId(invoiceId: string): Promise<InvoicePayment.Response[]> {
    return await this.invoicePaymentRepository.getByInvoiceId(invoiceId);
  }

  async get(paymentId: string): Promise<InvoicePayment.Response> {
    return await this.invoicePaymentRepository.get(paymentId);
  }

  // * UPDATE SERVICES
  async update(payload: InvoicePayment.Request.Update): Promise<InvoicePayment.Type> {
    return await this.invoicePaymentRepository.update(payload);
  }

  // * DELETE SERVICES
  async delete(paymentId: string): Promise<void> {
    return await this.invoicePaymentRepository.delete(paymentId);
  }

  // * BUSINESS LOGIC SERVICES
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
    const payment = await this.create({
      invoice_id: invoiceId,
      payment_method: paymentData.paymentMethod,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: 'completed', // Para pagos manuales los marcamos como completados
      reference_number: paymentData.referenceNumber,
      notes: paymentData.notes,
    });

    return payment;
  }
}