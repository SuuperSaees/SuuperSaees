import { InvoiceRepository } from '../repositories/invoices.repository';
import { InvoiceItemsRepository } from '../repositories/invoice-items.repository';
import { Invoice } from '~/lib/invoice.types';

export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemsRepository?: InvoiceItemsRepository,
  ) {}

  // * CREATE SERVICES
  async create(payload: Invoice.Request.Create): Promise<Invoice.Type> {
    // Calculate totals from items
    const subtotal = payload.invoice_items?.reduce((sum, item) => 
      sum + (item.quantity ?? 0 * item.unit_price), 0) ?? payload.subtotal_amount ?? 0;
    
    const taxAmount = payload.tax_amount ?? 0;
    const totalAmount = subtotal + taxAmount;

    const createdInvoice = await this.invoiceRepository.create({
      ...payload,
      subtotal_amount: subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    });

    // Create invoice items if provided
    if (payload.invoice_items && payload.invoice_items.length > 0) {
      await this.invoiceItemsRepository?.createMany(
        createdInvoice.id.toString(),
        payload.invoice_items
      );
    }

    return createdInvoice;
  }

  // * GET SERVICES
  async list(organizationId: string): Promise<{
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
    return await this.invoiceRepository.list(organizationId);
  }

  async get(invoiceId: string): Promise<Invoice.Relational> {
    return await this.invoiceRepository.get(invoiceId);
  }

  // * DELETE SERVICES
  async delete(invoiceId: string): Promise<void> {
    // Soft delete invoice items first
    await this.invoiceItemsRepository?.deleteByInvoiceId(invoiceId);
    
    // Then soft delete the invoice
    return await this.invoiceRepository.delete(invoiceId);
  }

  // * UPDATE SERVICES
  async update(payload: Invoice.Request.Update): Promise<Invoice.Type> {
    // Update invoice items if provided
    if (payload.invoice_items) {
      await this.invoiceItemsRepository?.updateMany(
        payload.id?.toString() ?? '',
        payload.invoice_items
      );

      // Recalculate totals
      const subtotal = payload.invoice_items.reduce((sum, item) => 
        sum + (item.quantity ?? 0 * item.unit_price), 0);
      
      const taxAmount = payload.tax_amount ?? 0;
      const totalAmount = subtotal + taxAmount;

      payload.subtotal_amount = subtotal;
      payload.total_amount = totalAmount;
    }

    // Remove invoice_items from payload before updating invoice
    const { ...invoicePayload } = payload;
    
    return await this.invoiceRepository.update(invoicePayload);
  }
}